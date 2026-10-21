import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slice/authSlice";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import imagepath from "../../constants/imagepath";
import NavigationStrings from "../../navigation/NavigationStrings";
import CommonTextInput from "../../components/CommonTextInput";
import StatusBadge from "../../components/StatusBadge";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";
import ValidationSchema from "../../schemas/validation";
import patientService from "../../services/patientService";
import ToastService from "../../services/toastService";

interface EditProfileProps {
  navigation: any;
}

type GenderType = "Female" | "Male" | "Other";

const EditProfile: React.FC<EditProfileProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  // Personal Info State
  const [firstName, setFirstName] = useState("Patient");
  const [lastName, setLastName] = useState("User");
  const [mobileNumber, setMobileNumber] = useState("5550192834");
  const [email, setEmail] = useState("patient@dentacare.com");
  const [gender, setGender] = useState<GenderType>("Female");
  const [dob, setDob] = useState("15 Aug 1995");
  const [bloodGroup, setBloodGroup] = useState("O+");

  // Aadhaar Document State
  const [aadhaarNumber, setAadhaarNumber] = useState("4582 9102 3456");
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(true);
  const [frontDocName, setFrontDocName] = useState("aadhaar_front_card.jpg");
  const [backDocName, setBackDocName] = useState("aadhaar_back_address.jpg");
  const [hasFrontDoc, setHasFrontDoc] = useState(true);
  const [hasBackDoc, setHasBackDoc] = useState(true);

  // Modals & Upload State
  const [activeUploadSide, setActiveUploadSide] = useState<"front" | "back" | null>(null);
  const [previewDocSide, setPreviewDocSide] = useState<"front" | "back" | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load current profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const p = await patientService.getProfile();
        if (p) {
          if (p.firstName) setFirstName(p.firstName);
          if (p.lastName) setLastName(p.lastName);
          if (p.phone) setMobileNumber(p.phone.replace(/[^0-9]/g, "").slice(-10));
          if (p.email) setEmail(p.email);
          if (p.gender) setGender(p.gender);
          if (p.dob) setDob(p.dob);
          if (p.bloodGroup) setBloodGroup(p.bloodGroup);
          if (p.aadhaarNumber) setAadhaarNumber(p.aadhaarNumber);
          setIsAadhaarVerified(Boolean(p.isAadhaarVerified));
        }
      } catch (e) {
        console.warn("[EditProfile] Failed to load profile", e);
      }
    };
    loadProfile();
  }, []);

  // Format Aadhaar Input (auto spaces every 4 digits)
  const handleAadhaarChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    setAadhaarNumber(parts.join(" "));
  };

  // Format Mobile Input (10 digits)
  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
    setMobileNumber(cleaned);
  };

  // Handle Save
  const handleSave = async () => {
    // Validate First and Last Name
    const firstNameVal = ValidationSchema.validateFullName(firstName);
    if (!firstNameVal.isValid) {
      ToastService.warning("Please enter a valid first name.", "Validation Error");
      return;
    }
    const lastNameVal = ValidationSchema.validateFullName(lastName);
    if (!lastNameVal.isValid) {
      ToastService.warning("Please enter a valid last name.", "Validation Error");
      return;
    }

    // Validate Phone
    const phoneVal = ValidationSchema.validatePhone(mobileNumber);
    if (!phoneVal.isValid) {
      ToastService.warning(phoneVal.error || "Please enter a valid 10-digit mobile number.", "Validation Error");
      return;
    }

    // Validate Email
    const emailVal = ValidationSchema.validateEmail(email, false);
    if (!emailVal.isValid) {
      ToastService.warning(emailVal.error || "Please enter a valid email address.", "Validation Error");
      return;
    }

    // Validate Aadhaar
    const aadhaarVal = ValidationSchema.validateAadhaar(aadhaarNumber, false);
    if (!aadhaarVal.isValid) {
      ToastService.warning(aadhaarVal.error || "Please enter a valid 12-digit Aadhaar number.", "Validation Error");
      return;
    }

    setIsSaving(true);

    try {
      const updated = await patientService.updateProfile({
        firstName: firstNameVal.cleanValue!,
        lastName: lastNameVal.cleanValue!,
        email: emailVal.cleanValue,
        phone: phoneVal.cleanValue!,
        gender,
        dob,
        bloodGroup,
        aadhaarNumber: aadhaarVal.cleanValue || undefined,
      });

      setIsSaving(false);

      // Update Redux user if active
      dispatch(
        setUser({
          id: updated.userId || "usr_001",
          name: `${updated.firstName} ${updated.lastName}`.trim(),
          phone: updated.phone,
          email: updated.email,
          role: "PATIENT",
          patientId: updated.id,
          isActive: true,
        })
      );

      ToastService.success(
        "Your profile details have been saved successfully.",
        "Profile Updated 🎉"
      );
      setTimeout(() => {
        navigation.goBack();
      }, 800);
    } catch (e: any) {
      setIsSaving(false);
      ToastService.error(e?.message || "Failed to update profile. Please try again.", "Update Error");
    }
  };

  // Document Upload Handlers
  const handleSelectUploadOption = (source: "camera" | "gallery") => {
    const side = activeUploadSide;
    setActiveUploadSide(null);
    const mockFilename =
      source === "camera"
        ? `aadhaar_${side}_cam_${Date.now().toString().slice(-4)}.jpg`
        : `aadhaar_${side}_scan_${Date.now().toString().slice(-4)}.png`;

    if (side === "front") {
      setHasFrontDoc(true);
      setFrontDocName(mockFilename);
    } else if (side === "back") {
      setHasBackDoc(true);
      setBackDocName(mockFilename);
    }

    ToastService.success(
      `Aadhaar ${side === "front" ? "Front Side" : "Back Side"} (${source === "camera" ? "Camera" : "Gallery"}) uploaded.`,
      "Document Uploaded"
    );
  };

  const handleRemoveDoc = (side: "front" | "back") => {
    Alert.alert(
      "Remove Document",
      `Are you sure you want to remove the ${side === "front" ? "Front" : "Back"} side of your Aadhaar card?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            if (side === "front") {
              setHasFrontDoc(false);
              setFrontDocName("");
            } else {
              setHasBackDoc(false);
              setBackDocName("");
            }
            ToastService.info(
              `Aadhaar ${side === "front" ? "Front" : "Back"} side removed.`,
              "Document Removed"
            );
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Top Header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + moderateScaleVertical(8) },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveHeaderBtn}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.primaryBlue} />
            ) : (
              <Text style={styles.saveHeaderText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + moderateScaleVertical(90) },
          ]}
        >
          {/* Avatar Photo Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={imagepath.userArjun}
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  Alert.alert(
                    "Change Profile Picture",
                    "Choose an option to update your photo",
                    [
                      { text: "Take Photo", onPress: () => {} },
                      { text: "Choose from Library", onPress: () => {} },
                      { text: "Cancel", style: "cancel" },
                    ]
                  )
                }
                style={styles.avatarCameraBadge}
              >
                <Ionicons
                  name="camera"
                  size={moderateScale(15)}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  "Change Profile Picture",
                  "Choose an option to update your photo",
                  [
                    { text: "Take Photo", onPress: () => {} },
                    { text: "Choose from Library", onPress: () => {} },
                    { text: "Cancel", style: "cancel" },
                  ]
                )
              }
              style={styles.changePhotoPill}
            >
              <Ionicons
                name="image-outline"
                size={moderateScale(14)}
                color={colors.primaryBlue}
              />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
            <Text style={styles.photoHintText}>JPG, PNG up to 5 MB</Text>
          </View>

          {/* Section: Personal Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconBadge}>
                <Ionicons
                  name="person-outline"
                  size={moderateScale(18)}
                  color={colors.primaryBlue}
                />
              </View>
              <View>
                <Text style={styles.sectionHeading}>Personal Information</Text>
                <Text style={styles.sectionSubheading}>
                  Your legal identity as per medical records
                </Text>
              </View>
            </View>

            {/* First Name & Last Name Row */}
            <View style={styles.nameRow}>
              <View style={styles.halfField}>
                <CommonTextInput
                  label="First Name"
                  required
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  showClearButton
                  onClear={() => setFirstName("")}
                  containerStyle={styles.halfInputContainer}
                />
              </View>

              <View style={styles.halfField}>
                <CommonTextInput
                  label="Last Name"
                  required
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  showClearButton
                  onClear={() => setLastName("")}
                  containerStyle={styles.halfInputContainer}
                />
              </View>
            </View>

            {/* Mobile Number Field */}
            <CommonTextInput
              label="Mobile Number"
              required
              badge={
                <StatusBadge
                  label="OTP Verified"
                  variant="success"
                  icon="checkmark-circle"
                />
              }
              placeholder="10-digit mobile number"
              value={mobileNumber}
              onChangeText={handleMobileChange}
              keyboardType="phone-pad"
              maxLength={10}
              leftComponent={
                <View style={styles.countryCodeBox}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <View style={styles.codeDivider} />
                </View>
              }
              rightComponent={
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Alert.alert(
                      "Change Mobile Number",
                      "A verification OTP will be sent to your new mobile number.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Change", onPress: () => {} },
                      ]
                    )
                  }
                  style={styles.changeActionBtn}
                >
                  <Text style={styles.changeActionText}>Edit</Text>
                </TouchableOpacity>
              }
            />

            {/* Email Field */}
            <CommonTextInput
              label="Email Address"
              placeholder="Enter email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            {/* Gender Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {(["Female", "Male", "Other"] as GenderType[]).map((item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.8}
                    onPress={() => setGender(item)}
                    style={[
                      styles.genderPill,
                      gender === item && styles.genderPillActive,
                    ]}
                  >
                    <Ionicons
                      name={
                        item === "Female"
                          ? "female"
                          : item === "Male"
                          ? "male"
                          : "transgender"
                      }
                      size={moderateScale(15)}
                      color={
                        gender === item ? colors.white : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.genderPillText,
                        gender === item && styles.genderPillTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date of Birth & Blood Group */}
            <View style={styles.nameRow}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Date of Birth</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    ToastService.info(
                      "Select your birth date for medical prescription records.",
                      "Date of Birth"
                    )
                  }
                  style={styles.inputContainer}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={moderateScale(17)}
                    color={colors.textSecondary}
                    style={styles.inputLeadingIcon}
                  />
                  <Text style={styles.staticFieldText}>{dob}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Blood Group</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Alert.alert(
                      "Blood Group",
                      "Select your blood group (O+, A+, B+, AB+, etc.)",
                      [
                        { text: "O+", onPress: () => setBloodGroup("O+") },
                        { text: "A+", onPress: () => setBloodGroup("A+") },
                        { text: "B+", onPress: () => setBloodGroup("B+") },
                        { text: "AB+", onPress: () => setBloodGroup("AB+") },
                        { text: "Cancel", style: "cancel" },
                      ]
                    )
                  }
                  style={styles.inputContainer}
                >
                  <Ionicons
                    name="water-outline"
                    size={moderateScale(17)}
                    color="#EF4444"
                    style={styles.inputLeadingIcon}
                  />
                  <Text style={styles.staticFieldText}>{bloodGroup}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={moderateScale(15)}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Section: Government ID & Documents (Aadhaar Card) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View
                style={[
                  styles.sectionIconBadge,
                  { backgroundColor: "#EFF6FF" },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={moderateScale(18)}
                  color={colors.primaryBlue}
                />
              </View>
              <View style={styles.headerTextCol}>
                <View style={styles.headingWithBadge}>
                  <Text style={styles.sectionHeading} numberOfLines={1}>
                    Government ID
                  </Text>
                  <StatusBadge
                    label="Required"
                    variant="warning"
                    showIcon={false}
                  />
                </View>
                <Text style={styles.sectionSubheading}>
                  Aadhaar is required for identity verification & ABHA digital records
                </Text>
              </View>
            </View>

            {/* Aadhaar Number Card */}
            <CommonTextInput
              label="Aadhaar Number"
              required
              badge={
                isAadhaarVerified ? (
                  <StatusBadge
                    label="UIDAI Verified"
                    variant="success"
                    icon="checkmark-done-circle"
                  />
                ) : null
              }
              placeholder="XXXX XXXX XXXX"
              value={
                showAadhaar
                  ? aadhaarNumber
                  : aadhaarNumber.replace(/[0-9]/g, "•")
              }
              onChangeText={handleAadhaarChange}
              keyboardType="numeric"
              maxLength={14}
              leftIconComponent={
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={moderateScale(19)}
                  color={colors.primaryBlue}
                  style={styles.inputLeadingIcon}
                />
              }
              inputStyle={styles.aadhaarTextInput}
              rightComponent={
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowAadhaar(!showAadhaar)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showAadhaar ? "eye-off-outline" : "eye-outline"}
                    size={moderateScale(19)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              }
            />

            {/* Aadhaar Upload Cards (Front & Back) */}
            <Text style={styles.docUploadSectionTitle}>
              Upload Aadhaar Card Copies
            </Text>

            {/* Front Side Document Card */}
            <View style={styles.docCard}>
              <View style={styles.docCardHeader}>
                <View style={styles.docIconPill}>
                  <Ionicons
                    name="image"
                    size={moderateScale(15)}
                    color={colors.primaryBlue}
                  />
                  <Text style={styles.docPillLabel} numberOfLines={1}>
                    Front Side (Photo)
                  </Text>
                </View>
                {hasFrontDoc && (
                  <View style={styles.docBadgeWrap}>
                    <StatusBadge
                      label="Uploaded"
                      variant="success"
                      icon="checkmark-circle"
                    />
                  </View>
                )}
              </View>

              {hasFrontDoc ? (
                <View style={styles.docPreviewRow}>
                  {/* Mock Visual Aadhaar Front Card */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setPreviewDocSide("front")}
                    style={styles.docThumbnailCard}
                  >
                    <View style={styles.tricolorHeader}>
                      <View style={[styles.tricolorBar, { backgroundColor: "#FF9933" }]} />
                      <View style={[styles.tricolorBar, { backgroundColor: "#FFFFFF" }]} />
                      <View style={[styles.tricolorBar, { backgroundColor: "#138808" }]} />
                    </View>
                    <View style={styles.cardMiniContent}>
                      <View style={styles.avatarMiniSquare}>
                        <Ionicons name="person" size={14} color={colors.primaryBlue} />
                      </View>
                      <View style={styles.linesStack}>
                        <View style={[styles.miniLine, { width: 45 }]} />
                        <View style={[styles.miniLine, { width: 35 }]} />
                        <View style={[styles.miniLine, { width: 50, backgroundColor: "#0066F6" }]} />
                      </View>
                    </View>
                    <View style={styles.cardWatermark}>
                      <Text style={styles.watermarkText}>AADHAAR</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.docFileInfoCol}>
                    <Text style={styles.docFileName} numberOfLines={1}>
                      {frontDocName}
                    </Text>
                    <Text style={styles.docFileSize}>1.2 MB • JPG Format</Text>
                    <View style={styles.docActionBtnRow}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setPreviewDocSide("front")}
                        style={styles.viewDocBtn}
                      >
                        <Ionicons
                          name="eye-outline"
                          size={moderateScale(13)}
                          color={colors.primaryBlue}
                        />
                        <Text style={styles.viewDocText}>Preview</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setActiveUploadSide("front")}
                        style={styles.replaceDocBtn}
                      >
                        <Ionicons
                          name="sync-outline"
                          size={moderateScale(13)}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.replaceDocText}>Replace</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRemoveDoc("front")}
                        style={styles.deleteDocBtn}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={moderateScale(14)}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveUploadSide("front")}
                  style={styles.emptyUploadBox}
                >
                  <View style={styles.uploadIconCircle}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={moderateScale(22)}
                      color={colors.primaryBlue}
                    />
                  </View>
                  <Text style={styles.uploadPromptTitle}>
                    Upload Aadhaar Front
                  </Text>
                  <Text style={styles.uploadPromptSubtitle}>
                    Take a photo or choose from gallery (PNG, JPG)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Back Side Document Card */}
            <View style={styles.docCard}>
              <View style={styles.docCardHeader}>
                <View style={styles.docIconPill}>
                  <Ionicons
                    name="home-outline"
                    size={moderateScale(15)}
                    color={colors.primaryBlue}
                  />
                  <Text style={styles.docPillLabel} numberOfLines={1}>
                    Back Side (Address)
                  </Text>
                </View>
                {hasBackDoc && (
                  <View style={styles.docBadgeWrap}>
                    <StatusBadge
                      label="Uploaded"
                      variant="success"
                      icon="checkmark-circle"
                    />
                  </View>
                )}
              </View>

              {hasBackDoc ? (
                <View style={styles.docPreviewRow}>
                  {/* Mock Visual Aadhaar Back Card */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setPreviewDocSide("back")}
                    style={styles.docThumbnailCard}
                  >
                    <View style={styles.tricolorHeader}>
                      <View style={[styles.tricolorBar, { backgroundColor: "#FF9933" }]} />
                      <View style={[styles.tricolorBar, { backgroundColor: "#FFFFFF" }]} />
                      <View style={[styles.tricolorBar, { backgroundColor: "#138808" }]} />
                    </View>
                    <View style={styles.cardMiniContent}>
                      <View style={styles.linesStack}>
                        <View style={[styles.miniLine, { width: 55 }]} />
                        <View style={[styles.miniLine, { width: 50 }]} />
                        <View style={[styles.miniLine, { width: 40 }]} />
                      </View>
                      <View style={styles.qrMiniSquare}>
                        <Ionicons name="qr-code" size={14} color={colors.textPrimary} />
                      </View>
                    </View>
                    <View style={styles.cardWatermark}>
                      <Text style={styles.watermarkText}>ADDRESS</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.docFileInfoCol}>
                    <Text style={styles.docFileName} numberOfLines={1}>
                      {backDocName}
                    </Text>
                    <Text style={styles.docFileSize}>1.4 MB • JPG Format</Text>
                    <View style={styles.docActionBtnRow}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setPreviewDocSide("back")}
                        style={styles.viewDocBtn}
                      >
                        <Ionicons
                          name="eye-outline"
                          size={moderateScale(13)}
                          color={colors.primaryBlue}
                        />
                        <Text style={styles.viewDocText}>Preview</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setActiveUploadSide("back")}
                        style={styles.replaceDocBtn}
                      >
                        <Ionicons
                          name="sync-outline"
                          size={moderateScale(13)}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.replaceDocText}>Replace</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRemoveDoc("back")}
                        style={styles.deleteDocBtn}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={moderateScale(14)}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveUploadSide("back")}
                  style={styles.emptyUploadBox}
                >
                  <View style={styles.uploadIconCircle}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={moderateScale(22)}
                      color={colors.primaryBlue}
                    />
                  </View>
                  <Text style={styles.uploadPromptTitle}>
                    Upload Aadhaar Back
                  </Text>
                  <Text style={styles.uploadPromptSubtitle}>
                    Address proof with official QR code (PNG, JPG)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Compliance & Security Guarantee Callout */}
            <View style={styles.securityCallout}>
              <Ionicons
                name="lock-closed"
                size={moderateScale(16)}
                color="#0284C7"
              />
              <Text style={styles.securityCalloutText}>
                Your Aadhaar card is stored with 256-bit encryption in accordance
                with UIDAI and HIPAA digital healthcare guidelines.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveMainBtn}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={moderateScale(18)}
                  color={colors.white}
                />
                <Text style={styles.saveMainBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Modal: Document Upload Source ActionSheet */}
        <Modal
          visible={activeUploadSide !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveUploadSide(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActiveUploadSide(null)}
          >
            <View style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <View style={styles.dragBar} />
                <Text style={styles.sheetTitle}>
                  Upload Aadhaar{" "}
                  {activeUploadSide === "front" ? "Front Side" : "Back Side"}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  Ensure all text and your photo are clear and glare-free
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleSelectUploadOption("camera")}
                style={styles.sheetOption}
              >
                <View
                  style={[
                    styles.sheetIconBox,
                    { backgroundColor: "#EFF6FF" },
                  ]}
                >
                  <Ionicons
                    name="camera-outline"
                    size={moderateScale(22)}
                    color={colors.primaryBlue}
                  />
                </View>
                <View style={styles.sheetOptionCol}>
                  <Text style={styles.sheetOptionTitle}>Take Photo</Text>
                  <Text style={styles.sheetOptionDesc}>
                    Use your device camera to scan card
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleSelectUploadOption("gallery")}
                style={styles.sheetOption}
              >
                <View
                  style={[
                    styles.sheetIconBox,
                    { backgroundColor: "#F0FDF4" },
                  ]}
                >
                  <Ionicons
                    name="images-outline"
                    size={moderateScale(22)}
                    color="#16A34A"
                  />
                </View>
                <View style={styles.sheetOptionCol}>
                  <Text style={styles.sheetOptionTitle}>
                    Choose from Gallery
                  </Text>
                  <Text style={styles.sheetOptionDesc}>
                    Pick an existing image from photos
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveUploadSide(null)}
                style={styles.sheetCancelBtn}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal: Full Document Preview */}
        <Modal
          visible={previewDocSide !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setPreviewDocSide(null)}
        >
          <View style={styles.previewModalWrapper}>
            <View style={styles.previewModalHeader}>
              <Text style={styles.previewModalTitle}>
                Aadhaar {previewDocSide === "front" ? "Front Side" : "Back Side"}
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewDocSide(null)}
                style={styles.previewCloseBtn}
              >
                <Ionicons name="close" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.previewCardContainer}>
              <View style={styles.fullAadhaarCard}>
                <View style={styles.fullTricolorBar}>
                  <View style={[styles.tricolorBar, { backgroundColor: "#FF9933" }]} />
                  <View style={[styles.tricolorBar, { backgroundColor: "#FFFFFF" }]} />
                  <View style={[styles.tricolorBar, { backgroundColor: "#138808" }]} />
                </View>

                <View style={styles.fullCardHeader}>
                  <View style={styles.emblemBadge}>
                    <Ionicons name="shield-checkmark" size={18} color="#FF9933" />
                  </View>
                  <View>
                    <Text style={styles.govTitle}>GOVERNMENT OF INDIA</Text>
                    <Text style={styles.uniqueIdTitle}>
                      Unique Identification Authority of India
                    </Text>
                  </View>
                </View>

                {previewDocSide === "front" ? (
                  <View style={styles.fullCardBody}>
                    <View style={styles.fullPhotoBox}>
                      <Image
                        source={imagepath.userArjun}
                        style={styles.fullPhotoImg}
                      />
                    </View>
                    <View style={styles.fullDetailsCol}>
                      <Text style={styles.fullDetailName}>
                        {firstName} {lastName}
                      </Text>
                      <Text style={styles.fullDetailLabel}>DOB: {dob}</Text>
                      <Text style={styles.fullDetailLabel}>
                        Gender: {gender}
                      </Text>
                      <View style={styles.aadhaarBadgePill}>
                        <Text style={styles.fullAadhaarNum}>
                          {aadhaarNumber || "4582 9102 3456"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.fullCardBodyBack}>
                    <View style={styles.addressCol}>
                      <Text style={styles.addressLabel}>Address:</Text>
                      <Text style={styles.addressVal}>
                        W-24, Green Park Extension,
                      </Text>
                      <Text style={styles.addressVal}>
                        Near Metro Station, New Delhi, 110016
                      </Text>
                      <Text style={styles.addressVal}>Phone: +91 {mobileNumber}</Text>
                    </View>
                    <View style={styles.fullQrBox}>
                      <Ionicons name="qr-code" size={54} color={colors.textPrimary} />
                    </View>
                  </View>
                )}

                <View style={styles.fullCardFooter}>
                  <Text style={styles.cardFooterTag}>
                    Mera Aadhaar, Meri Pehchan
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPreviewDocSide(null)}
                style={styles.previewDoneBtn}
              >
                <Text style={styles.previewDoneText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },

  // Top Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScaleVertical(12),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    color: colors.textPrimary,
  },
  saveHeaderBtn: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(14),
    backgroundColor: "#EFF6FF",
  },
  saveHeaderText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.primaryBlue,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(14),
  },

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    marginBottom: moderateScaleVertical(16),
  },
  avatarWrapper: {
    width: moderateScale(92),
    height: moderateScale(92),
    borderRadius: moderateScale(46),
    position: "relative",
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(46),
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarCameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: colors.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  changePhotoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(16),
    marginTop: moderateScaleVertical(10),
  },
  changePhotoText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.primaryBlue,
  },
  photoHintText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
    marginTop: moderateScaleVertical(4),
  },

  // Section Cards
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(18),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(14),
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    marginBottom: moderateScaleVertical(16),
  },
  sectionIconBadge: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextCol: {
    flex: 1,
  },
  headingWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: moderateScale(6),
  },
  sectionHeading: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14.5),
    color: colors.textPrimary,
    flexShrink: 1,
  },
  sectionSubheading: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 1,
  },


  // Form Fields
  nameRow: {
    flexDirection: "row",
    gap: moderateScale(10),
    marginBottom: moderateScaleVertical(12),
  },
  halfField: {
    flex: 1,
  },
  halfInputContainer: {
    marginBottom: 0,
  },
  fieldGroup: {
    marginBottom: moderateScaleVertical(12),
  },
  fieldLabel: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(5),
  },
  requiredStar: {
    color: "#EF4444",
  },


  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    minHeight: moderateScale(46),
  },
  inputLeadingIcon: {
    marginRight: moderateScale(8),
  },
  textInput: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: textScale(14),
    color: colors.textPrimary,
    paddingVertical: moderateScaleVertical(10),
  },
  clearInputBtn: {
    padding: moderateScale(4),
  },
  countryCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    marginRight: moderateScale(8),
  },
  flagEmoji: {
    fontSize: textScale(14),
  },
  countryCodeText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  codeDivider: {
    width: 1,
    height: moderateScale(16),
    backgroundColor: colors.borderLight,
    marginLeft: moderateScale(6),
  },
  changeActionBtn: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(8),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  changeActionText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  staticFieldText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },

  // Gender Row
  genderRow: {
    flexDirection: "row",
    gap: moderateScale(8),
  },
  genderPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
  },
  genderPillActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  genderPillText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  genderPillTextActive: {
    fontFamily: fontFamily.bold,
    color: colors.white,
  },

  // Aadhaar Section Details
  aadhaarNumberBox: {
    marginBottom: moderateScaleVertical(14),
  },
  aadhaarTextInput: {
    fontFamily: fontFamily.bold,
    letterSpacing: 1.5,
  },
  eyeBtn: {
    padding: moderateScale(6),
  },
  docUploadSectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(10),
  },

  // Document Cards
  docCard: {
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(14),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(12),
  },
  docCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(10),
    gap: moderateScale(8),
  },
  docIconPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
    flex: 1,
  },
  docPillLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.textPrimary,
    flexShrink: 1,
  },
  docBadgeWrap: {
    flexShrink: 0,
    alignItems: "flex-end",
  },


  docPreviewRow: {
    flexDirection: "row",
    gap: moderateScale(12),
    alignItems: "center",
  },
  docThumbnailCard: {
    width: moderateScale(94),
    height: moderateScale(62),
    backgroundColor: colors.white,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    position: "relative",
    justifyContent: "space-between",
    padding: 3,
  },
  tricolorHeader: {
    height: 3,
    flexDirection: "row",
  },
  tricolorBar: {
    flex: 1,
  },
  cardMiniContent: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingHorizontal: 3,
  },
  avatarMiniSquare: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  qrMiniSquare: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  linesStack: {
    gap: 2,
  },
  miniLine: {
    height: 3,
    backgroundColor: colors.borderLight,
    borderRadius: 1.5,
  },
  cardWatermark: {
    alignItems: "center",
  },
  watermarkText: {
    fontSize: textScale(7),
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },

  docFileInfoCol: {
    flex: 1,
  },
  docFileName: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.textPrimary,
  },
  docFileSize: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
    marginTop: 1,
    marginBottom: moderateScaleVertical(6),
  },
  docActionBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
  },
  viewDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(3),
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(6),
  },
  viewDocText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  replaceDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(3),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(6),
  },
  replaceDocText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.textSecondary,
  },
  deleteDocBtn: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(6),
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyUploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primaryBlue,
    borderRadius: moderateScale(12),
    backgroundColor: "#F8FAFC",
    paddingVertical: moderateScaleVertical(16),
    alignItems: "center",
  },
  uploadIconCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScaleVertical(6),
  },
  uploadPromptTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.primaryBlue,
  },
  uploadPromptSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center",
    paddingHorizontal: moderateScale(10),
  },

  securityCallout: {
    flexDirection: "row",
    gap: moderateScale(8),
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: moderateScale(12),
    padding: moderateScale(10),
    marginTop: moderateScaleVertical(4),
  },
  securityCalloutText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: "#0369A1",
    lineHeight: moderateScaleVertical(15),
  },

  // Sticky Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingTop: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  saveMainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(14),
    paddingVertical: moderateScaleVertical(14),
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveMainBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.white,
  },

  // Upload Source ActionSheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(12),
    paddingBottom: moderateScaleVertical(30),
  },
  sheetHeader: {
    alignItems: "center",
    marginBottom: moderateScaleVertical(16),
  },
  dragBar: {
    width: moderateScale(40),
    height: moderateScale(4),
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    marginBottom: moderateScaleVertical(12),
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    marginTop: 2,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: moderateScaleVertical(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: moderateScale(12),
  },
  sheetIconBox: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  sheetOptionCol: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(14),
    color: colors.textPrimary,
  },
  sheetOptionDesc: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
    marginTop: 1,
  },
  sheetCancelBtn: {
    marginTop: moderateScaleVertical(16),
    backgroundColor: colors.bgLight,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScaleVertical(12),
    alignItems: "center",
  },
  sheetCancelText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(14),
    color: colors.textPrimary,
  },

  // Document Preview Modal
  previewModalWrapper: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.94)",
    justifyContent: "center",
    paddingHorizontal: moderateScale(16),
  },
  previewModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(18),
  },
  previewModalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(17),
    color: colors.white,
  },
  previewCloseBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewCardContainer: {
    alignItems: "center",
  },
  fullAadhaarCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  fullTricolorBar: {
    height: 6,
    flexDirection: "row",
  },
  fullCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(12),
    paddingBottom: moderateScaleVertical(8),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  emblemBadge: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: "#FFFBEB",
    justifyContent: "center",
    alignItems: "center",
  },
  govTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  uniqueIdTitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(9),
    color: colors.textMuted,
  },
  fullCardBody: {
    flexDirection: "row",
    padding: moderateScale(16),
    gap: moderateScale(14),
  },
  fullPhotoBox: {
    width: moderateScale(74),
    height: moderateScale(92),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  fullPhotoImg: {
    width: "100%",
    height: "100%",
  },
  fullDetailsCol: {
    flex: 1,
    justifyContent: "space-between",
  },
  fullDetailName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
  },
  fullDetailLabel: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.textSecondary,
    marginTop: 2,
  },
  aadhaarBadgePill: {
    backgroundColor: "#EFF6FF",
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    marginTop: moderateScaleVertical(6),
  },
  fullAadhaarNum: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.primaryBlue,
    letterSpacing: 1.5,
  },

  fullCardBodyBack: {
    flexDirection: "row",
    padding: moderateScale(16),
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressCol: {
    flex: 1,
    marginRight: moderateScale(12),
  },
  addressLabel: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.textPrimary,
    marginBottom: 2,
  },
  addressVal: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    lineHeight: moderateScaleVertical(16),
  },
  fullQrBox: {
    width: moderateScale(70),
    height: moderateScale(70),
    backgroundColor: colors.bgLight,
    borderRadius: moderateScale(8),
    justifyContent: "center",
    alignItems: "center",
  },

  fullCardFooter: {
    backgroundColor: "#F8FAFC",
    paddingVertical: moderateScaleVertical(8),
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cardFooterTag: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(10),
    color: colors.textMuted,
  },
  previewDoneBtn: {
    marginTop: moderateScaleVertical(20),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScaleVertical(10),
    borderRadius: moderateScale(20),
  },
  previewDoneText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.white,
  },
});

export default EditProfile;
