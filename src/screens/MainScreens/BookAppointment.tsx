import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import imagepath from "../../constants/imagepath";
import NavigationStrings from "../../navigation/NavigationStrings";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";
import appointmentService from "../../services/appointmentService";
import ValidationSchema from "../../schemas/validation";
import { Appointment, Doctor, TimeSlot } from "../../types/models";
import { MOCK_DOCTORS, MOCK_PATIENT_PROFILE } from "../../services/mockData";
import ToastService from "../../services/toastService";

import {
  TREATMENTS_CATALOG,
  TreatmentOption,
  getAutoAssignedDoctor,
} from "../../constants/treatments";

export interface PatientBookingData {
  bookingFor: "SELF" | "OTHER";
  patientName: string;
  patientAge: string;
  patientGender: "Female" | "Male" | "Other";
  patientAadhaar: string;
  relationship?: string;
}

const SELF_PATIENT_INFO: PatientBookingData = {
  bookingFor: "SELF",
  patientName: `${MOCK_PATIENT_PROFILE.firstName} ${MOCK_PATIENT_PROFILE.lastName}`,
  patientAge: "29",
  patientGender: MOCK_PATIENT_PROFILE.gender,
  patientAadhaar: MOCK_PATIENT_PROFILE.aadhaarNumber || "4582 9102 3456",
  relationship: "Self",
};

export const formatAadhaarDisplay = (val?: string) => {
  if (!val) return "Not Provided";
  const clean = val.replace(/\s/g, "");
  if (clean.length === 12) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
  }
  return val;
};

// Generate next 6 days dynamically starting from today
const generateNextDates = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const list = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateKey = `${yyyy}-${mm}-${dd}`;

    list.push({
      id: String(i + 1),
      day: days[d.getDay()],
      date: String(d.getDate()),
      month: months[d.getMonth()],
      fullDate: dateKey,
    });
  }
  return list;
};

const DATES_LIST = generateNextDates();

const BookAppointment = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 640;
  const isSmallDevice = windowWidth < 360;
  const initialDoctorParam: Doctor | undefined = route?.params?.doctor;
  const initialTreatmentParam: TreatmentOption | undefined = route?.params?.treatment;
  const initialServiceName =
    route?.params?.selectedService ||
    initialTreatmentParam?.name ||
    TREATMENTS_CATALOG[0].name;

  const [selectedService, setSelectedService] = useState<string>(initialServiceName);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(
    initialDoctorParam || getAutoAssignedDoctor(initialServiceName)
  );
  const [isAutoAssigned, setIsAutoAssigned] = useState<boolean>(
    route?.params?.isAutoAssigned !== undefined
      ? route?.params?.isAutoAssigned
      : !initialDoctorParam
  );
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);

  const [selectedDateId, setSelectedDateId] = useState(DATES_LIST[0].id);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");
  const [notes, setNotes] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Active Patient for this booking (default: Self)
  const [patientData, setPatientData] = useState<PatientBookingData>(SELF_PATIENT_INFO);

  // Patient Selection Bottom Sheet State
  const [showPatientSheet, setShowPatientSheet] = useState<boolean>(false);
  const [sheetToggle, setSheetToggle] = useState<"SELF" | "OTHER">("SELF");
  const [sheetName, setSheetName] = useState<string>("");
  const [sheetAge, setSheetAge] = useState<string>("");
  const [sheetGender, setSheetGender] = useState<"Female" | "Male" | "Other">("Male");
  const [sheetAadhaar, setSheetAadhaar] = useState<string>("");
  const [sheetRelation, setSheetRelation] = useState<string>("Parent");
  const [sheetError, setSheetError] = useState<string | null>(null);

  const activeDate = DATES_LIST.find((d) => d.id === selectedDateId) || DATES_LIST[0];
  const currentTreatment =
    TREATMENTS_CATALOG.find((t) => t.name === selectedService) ||
    TREATMENTS_CATALOG[1];

  // Open the patient selection sheet and sync with active patient
  const openPatientSheet = () => {
    setSheetToggle(patientData.bookingFor);
    if (patientData.bookingFor === "OTHER") {
      setSheetName(patientData.patientName);
      setSheetAge(patientData.patientAge);
      setSheetGender(patientData.patientGender);
      setSheetAadhaar(formatAadhaarDisplay(patientData.patientAadhaar));
      setSheetRelation(patientData.relationship || "Parent");
    } else {
      setSheetName(sheetName || "");
      setSheetAge(sheetAge || "");
      setSheetGender(sheetGender || "Male");
      setSheetAadhaar(sheetAadhaar || "");
      setSheetRelation(sheetRelation || "Parent");
    }
    setSheetError(null);
    setShowPatientSheet(true);
  };

  // Format Aadhaar input cleanly as XXXX XXXX XXXX
  const handleAadhaarInput = (text: string) => {
    const raw = text.replace(/[^0-9]/g, "").slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    const formatted = parts ? parts.join(" ") : raw;
    setSheetAadhaar(formatted);
    if (sheetError) setSheetError(null);
  };

  // Apply patient selection from bottom sheet onto screen
  const handleApplyPatient = () => {
    if (sheetToggle === "SELF") {
      setPatientData(SELF_PATIENT_INFO);
      setShowPatientSheet(false);
      ToastService.info(
        "Appointment set for yourself (Patient User).",
        "Patient: Myself 👤"
      );
      return;
    }

    // Validate Other Person details
    const cleanAadhaar = sheetAadhaar.replace(/\s/g, "");
    const validation = ValidationSchema.validateOtherPatient({
      fullName: sheetName,
      age: sheetAge,
      gender: sheetGender,
      aadhaar: cleanAadhaar,
    });

    if (!validation.isValid) {
      setSheetError(validation.error || "Please verify patient details.");
      ToastService.warning(
        validation.error || "Please check inputs",
        "Invalid Patient Details"
      );
      return;
    }

    setSheetError(null);
    const updatedOther: PatientBookingData = {
      bookingFor: "OTHER",
      patientName: sheetName.trim(),
      patientAge: sheetAge.trim(),
      patientGender: sheetGender,
      patientAadhaar: cleanAadhaar,
      relationship: sheetRelation,
    };

    setPatientData(updatedOther);
    setShowPatientSheet(false);
    ToastService.success(
      `Appointment set for ${updatedOther.patientName} (${updatedOther.patientAge}y, ${updatedOther.patientGender})`,
      "Patient Details Updated 👥"
    );
  };

  // Fetch slots whenever selected date or doctor changes
  const fetchSlots = useCallback(async () => {
    setIsLoadingSlots(true);
    try {
      const slots = await appointmentService.getAvailableSlots(
        selectedDoctor.id,
        activeDate.fullDate
      );
      setTimeSlots(slots);
      // Select first available slot
      const firstAvailable = slots.find((s) => s.available);
      if (firstAvailable) {
        setSelectedTime(firstAvailable.time);
      }
    } catch (e) {
      console.warn("[BookAppointment] Failed to load slots", e);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDoctor.id, activeDate.fullDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleSelectTreatment = (treatment: TreatmentOption) => {
    setSelectedService(treatment.name);
    setShowServiceModal(false);

    // Auto-assign matching specialist
    const autoDoctor = getAutoAssignedDoctor(treatment.name);
    setSelectedDoctor(autoDoctor);
    setIsAutoAssigned(true);

    ToastService.info(
      `Assigned ${autoDoctor.name} (${treatment.department})`,
      "Specialist Auto-Assigned"
    );
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    // Validate inputs
    const validation = ValidationSchema.validateBookingSelection({
      service: selectedService,
      date: activeDate.fullDate,
      time: selectedTime,
    });

    if (!validation.isValid) {
      ToastService.warning(
        validation.error || "Please select all required booking details.",
        "Incomplete Selection"
      );
      return;
    }

    // Check slot availability locally
    const currentSlot = timeSlots.find((s) => s.time === selectedTime);
    if (currentSlot && !currentSlot.available) {
      ToastService.warning(
        "The selected time slot is already booked. Please choose another slot.",
        "Slot Unavailable"
      );
      fetchSlots();
      return;
    }

    setIsSubmitting(true);

    try {
      const appointment = await appointmentService.bookAppointment({
        doctorId: selectedDoctor.id,
        serviceId: selectedService,
        date: activeDate.fullDate,
        timeSlot: selectedTime,
        notes: notes.trim(),
        bookingFor: patientData.bookingFor,
        patientName: patientData.patientName,
        patientAge: patientData.patientAge,
        patientGender: patientData.patientGender,
        patientAadhaar: patientData.patientAadhaar,
        patientRelation: patientData.relationship,
      });

      setIsSubmitting(false);
      setConfirmedBooking(appointment);
      setShowSuccessModal(true);
      ToastService.success(
        `Appointment confirmed for ${patientData.patientName}!`,
        "Appointment Confirmed 🎉"
      );
    } catch (error: any) {
      setIsSubmitting(false);

      if (error?.statusCode === 409) {
        ToastService.error(
          "This appointment slot was just booked by another patient. Please pick another time slot.",
          "Slot Conflict"
        );
        fetchSlots();
      } else {
        ToastService.error(
          error?.message ||
            "Unable to confirm appointment at this time. Please check your connection.",
          "Booking Error"
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + moderateScaleVertical(8) }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              isSmallDevice && { marginRight: moderateScale(10) },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP 2 OF 2</Text>
            </View>
            <Text
              style={[
                styles.headerTitle,
                isSmallDevice && { fontSize: textScale(16) },
                isTablet && { fontSize: textScale(20) },
              ]}
              numberOfLines={1}
            >
              Doctor & Schedule
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                isSmallDevice && { fontSize: textScale(10.5) },
              ]}
              numberOfLines={2}
            >
              Review assigned doctor & select appointment slot
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateScaleVertical(100) },
        ]}
      >
        {/* PATIENT DETAILS CARD */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Patient Details</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openPatientSheet}
              style={styles.switchPatientActionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="swap-horizontal" size={moderateScale(14)} color={colors.primaryBlue} />
              <Text style={styles.switchPatientActionText}>Change / Switch</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={openPatientSheet}
            style={[
              styles.patientDisplayCard,
              patientData.bookingFor === "OTHER" && styles.patientDisplayCardOther,
            ]}
          >
            {/* Top row with Patient Type Badge and Edit Hint */}
            <View style={styles.patientTopBadgeRow}>
              <View
                style={[
                  styles.patientTypePill,
                  patientData.bookingFor === "OTHER"
                    ? styles.patientTypePillOther
                    : styles.patientTypePillSelf,
                ]}
              >
                <Ionicons
                  name={patientData.bookingFor === "OTHER" ? "people" : "person"}
                  size={moderateScale(12)}
                  color={patientData.bookingFor === "OTHER" ? "#B45309" : colors.primaryBlue}
                />
                <Text
                  style={[
                    styles.patientTypePillText,
                    patientData.bookingFor === "OTHER"
                      ? styles.patientTypePillTextOther
                      : styles.patientTypePillTextSelf,
                  ]}
                  numberOfLines={1}
                >
                  {patientData.bookingFor === "OTHER"
                    ? `FOR SOMEONE ELSE (${patientData.relationship?.toUpperCase() || "OTHER"})`
                    : "FOR MYSELF (PRIMARY)"}
                </Text>
              </View>

              <View style={styles.patientQuickEditBadge}>
                <Ionicons name="pencil-sharp" size={moderateScale(11)} color={colors.primaryBlue} />
                <Text style={styles.patientQuickEditText}>Edit</Text>
              </View>
            </View>

            {/* Patient Name & Avatar Row */}
            <View style={styles.patientIdentityRow}>
              <View
                style={[
                  styles.patientAvatarBubble,
                  patientData.bookingFor === "OTHER"
                    ? styles.patientAvatarBubbleOther
                    : styles.patientAvatarBubbleSelf,
                ]}
              >
                <Text
                  style={[
                    styles.patientAvatarText,
                    patientData.bookingFor === "OTHER"
                      ? styles.patientAvatarTextOther
                      : styles.patientAvatarTextSelf,
                  ]}
                >
                  {patientData.patientName.trim().charAt(0).toUpperCase() || "P"}
                </Text>
              </View>

              <View style={styles.patientIdentityMeta}>
                <Text style={styles.patientMainName} numberOfLines={1}>
                  {patientData.patientName}
                </Text>
                <Text style={styles.patientSubLabel} numberOfLines={1}>
                  {patientData.bookingFor === "SELF"
                    ? "Logged-in Profile Account"
                    : `Relationship: ${patientData.relationship || "Other Person"}`}
                </Text>
              </View>
            </View>

            {/* Core Patient Fields Grid: Name, Age, Aadhaar, Gender */}
            <View style={styles.patientDataGrid}>
              {/* Age */}
              <View style={styles.patientDataCol}>
                <Text style={styles.patientDataColLabel}>AGE</Text>
                <View style={styles.patientDataValueRow}>
                  <Ionicons name="calendar-outline" size={moderateScale(12)} color={colors.textSecondary} />
                  <Text style={styles.patientDataValueText}>
                    {patientData.patientAge ? `${patientData.patientAge} Yrs` : "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.patientDataDivider} />

              {/* Gender */}
              <View style={styles.patientDataCol}>
                <Text style={styles.patientDataColLabel}>GENDER</Text>
                <View style={styles.patientDataValueRow}>
                  <Ionicons
                    name={
                      patientData.patientGender === "Female"
                        ? "female"
                        : patientData.patientGender === "Male"
                        ? "male"
                        : "person-outline"
                    }
                    size={moderateScale(12)}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.patientDataValueText}>
                    {patientData.patientGender}
                  </Text>
                </View>
              </View>

              <View style={styles.patientDataDivider} />

              {/* Aadhaar */}
              <View style={[styles.patientDataCol, { flex: 1.4 }]}>
                <Text style={styles.patientDataColLabel}>AADHAAR CARD</Text>
                <View style={styles.patientDataValueRow}>
                  <Ionicons name="shield-checkmark" size={moderateScale(12)} color="#059669" />
                  <Text style={styles.patientDataValueText} numberOfLines={1}>
                    {formatAadhaarDisplay(patientData.patientAadhaar)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tap hint footer */}
            <View style={styles.patientCardFooter}>
              <Ionicons
                name="information-circle-outline"
                size={moderateScale(13)}
                color={patientData.bookingFor === "OTHER" ? "#B45309" : colors.primaryBlue}
              />
              <Text
                style={[
                  styles.patientCardFooterText,
                  patientData.bookingFor === "OTHER" && { color: "#92400E" },
                ]}
                numberOfLines={1}
              >
                {patientData.bookingFor === "OTHER"
                  ? "Tap to update or switch back to Myself"
                  : "Tap to switch to Someone Else (Parents, Kids, Spouse)"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* STEP 1: Select Dental Treatment */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>1. Dental Treatment</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate(NavigationStrings.SELECT_TREATMENT, {
                  selectedService: selectedService,
                })
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.changeActionText}>Change Treatment</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(NavigationStrings.SELECT_TREATMENT, {
                selectedService: selectedService,
              })
            }
            style={styles.treatmentSelectorCard}
          >
            <View style={styles.treatmentLeftBox}>
              <View style={styles.treatmentIconCircle}>
                {currentTreatment.iconSet === "ion" ? (
                  <Ionicons
                    name={currentTreatment.icon as any}
                    size={moderateScale(22)}
                    color={colors.primaryBlue}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={currentTreatment.icon as any}
                    size={moderateScale(22)}
                    color={colors.primaryBlue}
                  />
                )}
              </View>
              <View style={styles.treatmentInfoCol}>
                <View style={styles.deptBadge}>
                  <Text style={styles.deptBadgeText} numberOfLines={1}>{currentTreatment.department.toUpperCase()}</Text>
                </View>
                <Text style={styles.treatmentNameText} numberOfLines={2}>{currentTreatment.name}</Text>
                <Text style={styles.treatmentMetaText} numberOfLines={2}>
                  {currentTreatment.duration} · {currentTreatment.price}
                </Text>
              </View>
            </View>
            <View style={styles.treatmentChevronCircle}>
              <Ionicons name="swap-horizontal" size={moderateScale(16)} color={colors.primaryBlue} />
            </View>
          </TouchableOpacity>
        </View>

        {/* STEP 2: Auto-Assigned Specialist Doctor */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>2. Auto-Assigned Specialist</Text>
            <View style={styles.autoAssignHeaderPill}>
              <View style={styles.autoAssignPulseDot} />
              <Text
                style={[
                  styles.autoAssignHeaderText,
                  isSmallDevice && { fontSize: textScale(9) },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {isSmallDevice ? "✨ MATCHED" : "✨ SPECIALIST MATCHED"}
              </Text>
            </View>
          </View>

          <View style={styles.doctorMiniCard}>
            <Image
              source={selectedDoctor.image || imagepath.dentistRohan}
              style={styles.doctorAvatar}
              resizeMode="cover"
            />
            <View style={styles.doctorDetails}>
              <View style={styles.doctorNameRow}>
                <Text style={styles.doctorName} numberOfLines={1}>{selectedDoctor.name}</Text>
              </View>
              <Text style={styles.doctorDegree} numberOfLines={1}>{selectedDoctor.degree}</Text>

              {/* Department Match Badge */}
              <View style={styles.matchBadgeRow}>
                <Text style={styles.matchBadgeText} numberOfLines={1}>
                  {isAutoAssigned
                    ? `Matched for ${currentTreatment.department} Dept`
                    : `Specialist in ${selectedDoctor.specialty}`}
                </Text>
              </View>

              <View style={styles.doctorMetaRow}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={moderateScale(12)} color={colors.starYellow} />
                  <Text style={styles.ratingText}>
                    {" "}
                    {selectedDoctor.rating}{" "}
                    <Text style={styles.reviewCountText}>({selectedDoctor.reviewsCount})</Text>
                  </Text>
                </View>
                <Text style={styles.dotSeparator}>•</Text>
                <Ionicons name="location-outline" size={moderateScale(12)} color={colors.textSecondary} />
                <Text style={styles.clinicLocationText} numberOfLines={1}>
                  {selectedDoctor.location || "Main Hospital"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Select Date Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesList}
          >
            {DATES_LIST.map((item) => {
              const isSelected = selectedDateId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDateId(item.id)}
                  style={[
                    styles.dateCard,
                    isSelected ? styles.dateCardActive : styles.dateCardInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateDayText,
                      isSelected ? styles.textWhite : styles.textSecondary,
                    ]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumberText,
                      isSelected ? styles.textWhite : styles.textPrimary,
                    ]}
                  >
                    {item.date}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonthText,
                      isSelected ? styles.textWhite : styles.textMuted,
                    ]}
                  >
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Select Time Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.timeSectionHeader}>
            <Text style={styles.sectionLabel}>Select Time</Text>
            {isLoadingSlots && <ActivityIndicator size="small" color={colors.primaryBlue} />}
          </View>

          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((slot, index) => {
              const isSelected = selectedTime === slot.time;
              const isAvailable = slot.available;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  disabled={!isAvailable}
                  onPress={() => setSelectedTime(slot.time)}
                  style={[
                    styles.timeChip,
                    isTablet && styles.timeChipTablet,
                    isSmallDevice && styles.timeChipSmall,
                    !isAvailable && styles.timeChipDisabled,
                    isSelected && isAvailable && styles.timeChipActive,
                    !isSelected && isAvailable && styles.timeChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      isSmallDevice && { fontSize: textScale(11.5) },
                      !isAvailable && styles.textDisabled,
                      isSelected && isAvailable && styles.textWhite,
                      !isSelected && isAvailable && styles.textPrimary,
                    ]}
                    numberOfLines={1}
                  >
                    {slot.time}
                  </Text>
                  {!isAvailable && (
                    <Text style={styles.bookedTag} numberOfLines={1}>Booked</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Add Notes (Optional) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Add Notes (Optional)</Text>
          <TextInput
            placeholder="Any specific dental concerns or medical history?"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />
        </View>
      </ScrollView>

      {/* Fixed Confirm Button */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, moderateScaleVertical(14)) },
        ]}
      >
        <View style={styles.bottomBarInner}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleConfirm}
            disabled={isSubmitting}
            style={[styles.confirmButton, isSubmitting && { opacity: 0.8 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Confirmation Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={moderateScale(56)} color={colors.primaryBlue} />
            </View>
            <Text style={styles.modalTitle}>Appointment Confirmed!</Text>
            <Text style={styles.modalSubtitle}>
              Your appointment with {selectedDoctor.name} for {selectedService} is scheduled for{" "}
              <Text style={{ fontFamily: fontFamily.bold, color: colors.primaryBlue }}>
                {activeDate.day}, {activeDate.date} {activeDate.month} at {selectedTime}
              </Text>
              .
            </Text>

            {/* Patient Confirmation Card */}
            <View style={styles.confirmPatientCard}>
              <View style={styles.confirmPatientTop}>
                <Ionicons
                  name={patientData.bookingFor === "OTHER" ? "people" : "person"}
                  size={moderateScale(14)}
                  color={patientData.bookingFor === "OTHER" ? "#D97706" : colors.primaryBlue}
                />
                <Text style={styles.confirmPatientType}>
                  {patientData.bookingFor === "OTHER"
                    ? `BOOKED FOR: ${patientData.relationship?.toUpperCase() || "OTHER PERSON"}`
                    : "BOOKED FOR: MYSELF"}
                </Text>
              </View>
              <Text style={styles.confirmPatientName}>{patientData.patientName}</Text>
              <Text style={styles.confirmPatientMeta}>
                {patientData.patientAge} Yrs • {patientData.patientGender} • Aadhaar: {formatAadhaarDisplay(patientData.patientAadhaar)}
              </Text>
            </View>

            {confirmedBooking?.tokenNumber && (
              <View style={styles.tokenPill}>
                <Text style={styles.tokenLabel}>Queue Token: #{confirmedBooking.tokenNumber}</Text>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate(NavigationStrings.DASHBOARD);
              }}
              style={styles.modalDoneBtn}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Patient Selection Bottom Sheet */}
      <Modal
        visible={showPatientSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPatientSheet(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetBackdrop}
        >
          <TouchableOpacity
            style={styles.sheetDismissOverlay}
            activeOpacity={1}
            onPress={() => setShowPatientSheet(false)}
          />
          <View
            style={[
              styles.modalSheetContainer,
              styles.patientSheetContainer,
              { paddingBottom: Math.max(insets.bottom, moderateScaleVertical(16)) },
            ]}
          >
            <View style={styles.sheetDragBar} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderTitleCol}>
                <Text style={styles.sheetTitle} numberOfLines={1}>
                  Select Patient
                </Text>
                <Text style={styles.sheetSubtitle} numberOfLines={2}>
                  Choose whether this appointment is for yourself or someone else
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPatientSheet(false)}
                style={styles.sheetCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Segmented Control Toggle: Myself vs Someone Else */}
            <View style={styles.segmentedToggleWrap}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSheetToggle("SELF");
                  setSheetError(null);
                }}
                style={[
                  styles.segmentedToggleBtn,
                  sheetToggle === "SELF" && styles.segmentedToggleBtnActive,
                ]}
              >
                <Ionicons
                  name="person"
                  size={moderateScale(15)}
                  color={sheetToggle === "SELF" ? colors.primaryBlue : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentedToggleText,
                    sheetToggle === "SELF" && styles.segmentedToggleTextActive,
                  ]}
                >
                  Myself
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSheetToggle("OTHER");
                  setSheetError(null);
                }}
                style={[
                  styles.segmentedToggleBtn,
                  sheetToggle === "OTHER" && styles.segmentedToggleBtnActive,
                ]}
              >
                <Ionicons
                  name="people"
                  size={moderateScale(16)}
                  color={sheetToggle === "OTHER" ? colors.primaryBlue : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentedToggleText,
                    sheetToggle === "OTHER" && styles.segmentedToggleTextActive,
                  ]}
                >
                  Someone Else
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sheet Body ScrollView */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.patientSheetBodyScroll}
              contentContainerStyle={{ paddingBottom: moderateScaleVertical(16) }}
            >
              {sheetToggle === "SELF" ? (
                /* TAB 1: SELF (Myself) */
                <View style={styles.selfTabContent}>
                  <View style={styles.selfProfileCard}>
                    <View style={styles.selfCardHeader}>
                      <View style={styles.selfAvatarCircle}>
                        <Ionicons name="person" size={moderateScale(24)} color={colors.primaryBlue} />
                      </View>
                      <View style={styles.selfMetaCol}>
                        <View style={styles.verifiedRow}>
                          <Ionicons name="checkmark-circle" size={moderateScale(14)} color="#059669" />
                          <Text style={styles.verifiedText}>VERIFIED PATIENT PROFILE</Text>
                        </View>
                        <Text style={styles.selfFullName}>
                          {MOCK_PATIENT_PROFILE.firstName} {MOCK_PATIENT_PROFILE.lastName}
                        </Text>
                        <Text style={styles.selfPhone}>{MOCK_PATIENT_PROFILE.phone}</Text>
                      </View>
                    </View>

                    <View style={styles.selfDivider} />

                    <View style={styles.selfDataRow}>
                      <View style={styles.selfDataCell}>
                        <Text style={styles.selfDataLabel}>AGE</Text>
                        <Text style={styles.selfDataValue}>29 Yrs</Text>
                      </View>
                      <View style={styles.selfDataCell}>
                        <Text style={styles.selfDataLabel}>GENDER</Text>
                        <Text style={styles.selfDataValue}>{MOCK_PATIENT_PROFILE.gender}</Text>
                      </View>
                      <View style={[styles.selfDataCell, { flex: 1.4 }]}>
                        <Text style={styles.selfDataLabel}>AADHAAR NUMBER</Text>
                        <Text style={styles.selfDataValue}>
                          {formatAadhaarDisplay(MOCK_PATIENT_PROFILE.aadhaarNumber || "4582 9102 3456")}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.infoCallout}>
                    <Ionicons name="information-circle-outline" size={moderateScale(18)} color={colors.primaryBlue} />
                    <Text style={styles.infoCalloutText}>
                      Your digital dental history, prescriptions, and post-checkup records will be securely linked to your account.
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={handleApplyPatient}
                    style={styles.sheetApplyBtn}
                  >
                    <Text style={styles.sheetApplyBtnText}>Confirm for Myself</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* TAB 2: OTHER PERSON */
                <View style={styles.otherTabContent}>
                  {sheetError && (
                    <View style={styles.errorBanner}>
                      <Ionicons name="alert-circle" size={moderateScale(16)} color="#DC2626" />
                      <Text style={styles.errorBannerText}>{sheetError}</Text>
                    </View>
                  )}

                  {/* Field 1: Patient Full Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Patient's Full Name <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <View style={styles.inputFieldBox}>
                      <Ionicons name="person-outline" size={moderateScale(18)} color={colors.textSecondary} />
                      <TextInput
                        placeholder="e.g. Ramesh Kumar"
                        placeholderTextColor={colors.textMuted}
                        value={sheetName}
                        onChangeText={(txt) => {
                          setSheetName(txt);
                          if (sheetError) setSheetError(null);
                        }}
                        autoCapitalize="words"
                        style={styles.textInputField}
                      />
                    </View>
                  </View>

                  {/* Field 2 & 3: Age & Gender */}
                  <View style={styles.twoColRow}>
                    {/* Age */}
                    <View style={[styles.inputGroup, { flex: 0.9 }]}>
                      <Text style={styles.inputLabel}>
                        Age (Years) <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={styles.inputFieldBox}>
                        <Ionicons name="calendar-outline" size={moderateScale(18)} color={colors.textSecondary} />
                        <TextInput
                          placeholder="e.g. 34"
                          placeholderTextColor={colors.textMuted}
                          value={sheetAge}
                          onChangeText={(txt) => {
                            setSheetAge(txt.replace(/[^0-9]/g, "").slice(0, 3));
                            if (sheetError) setSheetError(null);
                          }}
                          keyboardType="numeric"
                          maxLength={3}
                          style={styles.textInputField}
                        />
                      </View>
                    </View>

                    {/* Gender */}
                    <View style={[styles.inputGroup, { flex: 1.3 }]}>
                      <Text style={styles.inputLabel}>
                        Gender <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={styles.genderPillsRow}>
                        {(["Female", "Male", "Other"] as const).map((g) => {
                          const isSelected = sheetGender === g;
                          return (
                            <TouchableOpacity
                              key={g}
                              activeOpacity={0.7}
                              onPress={() => setSheetGender(g)}
                              style={[
                                styles.genderPill,
                                isSelected && styles.genderPillActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.genderPillText,
                                  isSelected && styles.genderPillTextActive,
                                ]}
                              >
                                {g}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  {/* Field 4: Aadhaar Card Number */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelWithBadgeRow}>
                      <Text style={styles.inputLabel}>
                        Aadhaar Card Number <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View style={styles.govIdTag}>
                        <Ionicons name="shield-checkmark" size={10} color="#059669" />
                        <Text style={styles.govIdTagText}>Govt ID</Text>
                      </View>
                    </View>
                    <View style={styles.inputFieldBox}>
                      <Ionicons name="card-outline" size={moderateScale(18)} color={colors.textSecondary} />
                      <TextInput
                        placeholder="12-digit Aadhaar (e.g. 4582 9102 3456)"
                        placeholderTextColor={colors.textMuted}
                        value={sheetAadhaar}
                        onChangeText={handleAadhaarInput}
                        keyboardType="numeric"
                        maxLength={14}
                        style={styles.textInputField}
                      />
                    </View>
                    <Text style={styles.fieldHelpText}>
                      Required for clinic verification & government health registry.
                    </Text>
                  </View>

                  {/* Field 5: Relationship */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Relationship to Patient</Text>
                    <View style={styles.relationPillsRow}>
                      {["Parent", "Spouse", "Child", "Sibling", "Friend", "Other"].map((rel) => {
                        const isSelected = sheetRelation === rel;
                        return (
                          <TouchableOpacity
                            key={rel}
                            activeOpacity={0.7}
                            onPress={() => setSheetRelation(rel)}
                            style={[
                              styles.relationPill,
                              isSelected && styles.relationPillActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.relationPillText,
                                isSelected && styles.relationPillTextActive,
                              ]}
                            >
                              {rel}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Apply Button */}
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={handleApplyPatient}
                    style={styles.sheetApplyBtn}
                  >
                    <Text style={styles.sheetApplyBtnText}>Save & Show on Screen</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: Treatment Selection Bottom Sheet */}
      <Modal
        visible={showServiceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity
            style={styles.sheetDismissOverlay}
            activeOpacity={1}
            onPress={() => setShowServiceModal(false)}
          />
          <View
            style={[
              styles.modalSheetContainer,
              { paddingBottom: Math.max(insets.bottom, moderateScaleVertical(16)) },
            ]}
          >
            <View style={styles.sheetDragBar} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderTitleCol}>
                <Text style={styles.sheetTitle} numberOfLines={1}>
                  Choose Dental Treatment
                </Text>
                <Text style={styles.sheetSubtitle} numberOfLines={2}>
                  Specialist will be auto-assigned based on your treatment
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowServiceModal(false)}
                style={styles.sheetCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.sheetListScroll}
              contentContainerStyle={{ paddingBottom: moderateScaleVertical(20) }}
            >
              {TREATMENTS_CATALOG.map((item) => {
                const isSelected = selectedService === item.name;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelectTreatment(item)}
                    style={[
                      styles.treatmentItemCard,
                      isSelected && styles.treatmentItemCardActive,
                    ]}
                  >
                    <View style={styles.treatmentItemLeft}>
                      <View
                        style={[
                          styles.treatmentItemIconCircle,
                          isSelected && { backgroundColor: "#EFF6FF" },
                        ]}
                      >
                        {item.iconSet === "ion" ? (
                          <Ionicons
                            name={item.icon as any}
                            size={moderateScale(20)}
                            color={isSelected ? colors.primaryBlue : colors.textPrimary}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name={item.icon as any}
                            size={moderateScale(20)}
                            color={isSelected ? colors.primaryBlue : colors.textPrimary}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1, marginRight: moderateScale(8) }}>
                        <View style={styles.itemDeptRow}>
                          <Text style={styles.itemDeptText}>{item.department}</Text>
                        </View>
                        <Text
                          style={[
                            styles.itemTitle,
                            isSelected && { color: colors.primaryBlue, fontFamily: fontFamily.bold },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.itemSpecialtyText} numberOfLines={1}>
                          {item.specialtyTag}
                        </Text>
                        <View style={styles.itemAutoDoctorRow}>
                          <Text style={styles.itemAutoDoctorText}>
                            ✨ Assigned: {item.recommendedDoctorName}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.itemRightCol}>
                      <Text style={styles.itemPriceText}>{item.price}</Text>
                      <Text style={styles.itemDurationText}>{item.duration}</Text>
                      <View
                        style={[
                          styles.selectionRadio,
                          isSelected && styles.selectionRadioActive,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={12} color={colors.white} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScaleVertical(12),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.backBtnBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(14),
    flexShrink: 0,
  },
  headerTitleContainer: {
    flex: 1,
    minWidth: 0,
  },
  stepBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(5),
    marginBottom: moderateScaleVertical(2),
  },
  stepBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: colors.primaryBlue,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(16),
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  doctorMiniCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    padding: moderateScale(14),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: moderateScaleVertical(20),
  },
  doctorAvatar: {
    width: moderateScale(54),
    height: moderateScale(54),
    borderRadius: moderateScale(14),
    flexShrink: 0,
  },
  doctorDetails: {
    flex: 1,
    minWidth: 0,
    marginLeft: moderateScale(14),
  },
  doctorName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
  },
  doctorDegree: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: moderateScaleVertical(4),
  },
  ratingText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.textPrimary,
  },
  reviewCountText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
  },
  sectionContainer: {
    marginBottom: moderateScaleVertical(22),
  },
  timeSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(10),
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
    flexShrink: 1,
    marginRight: moderateScale(8),
    marginBottom: moderateScaleVertical(10),
  },
  serviceSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(14),
  },
  serviceSelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },
  selectedServiceText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(14),
    color: colors.textPrimary,
  },
  serviceDropdown: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(14),
    marginTop: moderateScaleVertical(8),
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  serviceOptionActive: {
    backgroundColor: colors.primaryBlueLight,
  },
  serviceOptionText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  serviceOptionTextActive: {
    fontFamily: fontFamily.semiBold,
    color: colors.primaryBlue,
  },
  datesList: {
    gap: moderateScale(10),
    paddingRight: moderateScale(20),
  },
  dateCard: {
    width: moderateScale(62),
    paddingVertical: moderateScaleVertical(12),
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  dateCardActive: {
    backgroundColor: colors.primaryBlue,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  dateCardInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dateDayText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    marginBottom: moderateScaleVertical(4),
  },
  dateNumberText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
  },
  dateMonthText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    marginTop: moderateScaleVertical(2),
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(8),
  },
  timeChip: {
    flexBasis: "30.5%",
    flexGrow: 1,
    maxWidth: "32%",
    paddingVertical: moderateScaleVertical(12),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  timeChipSmall: {
    flexBasis: "48%",
    maxWidth: "48.5%",
  },
  timeChipTablet: {
    flexBasis: "23%",
    maxWidth: "23.5%",
  },
  timeChipActive: {
    backgroundColor: colors.primaryBlue,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  timeChipInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timeChipDisabled: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    opacity: 0.6,
  },
  timeChipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
  },
  bookedTag: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(9),
    color: colors.textMuted,
    marginTop: 2,
  },
  textWhite: {
    color: colors.white,
  },
  textPrimary: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  textMuted: {
    color: colors.textMuted,
  },
  textDisabled: {
    color: colors.textMuted,
  },
  notesInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(12),
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textPrimary,
    minHeight: moderateScaleVertical(70),
    textAlignVertical: "top",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(12),
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomBarInner: {
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  confirmButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(28),
    paddingVertical: moderateScaleVertical(15),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(24),
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconCircle: {
    marginBottom: moderateScaleVertical(14),
  },
  modalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(20),
    color: colors.textPrimary,
    textAlign: "center",
  },
  modalSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: textScale(20),
    marginVertical: moderateScaleVertical(12),
  },
  tokenPill: {
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(14),
    marginBottom: moderateScaleVertical(8),
  },
  tokenLabel: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.primaryBlue,
  },
  modalDoneBtn: {
    width: "100%",
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(24),
    paddingVertical: moderateScaleVertical(13),
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScaleVertical(10),
  },
  modalDoneText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.white,
  },

  // Auto-Assign Doctor Flow Styles
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: moderateScaleVertical(4),
    marginBottom: moderateScaleVertical(10),
  },
  changeActionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.primaryBlue,
  },
  treatmentSelectorCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
  },
  treatmentLeftBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    marginRight: moderateScale(10),
  },
  treatmentIconCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  treatmentInfoCol: {
    marginLeft: moderateScale(12),
    flex: 1,
    minWidth: 0,
  },
  deptBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    marginBottom: 2,
  },
  deptBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: colors.primaryBlue,
    letterSpacing: 0.4,
  },
  treatmentNameText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.textPrimary,
  },
  treatmentMetaText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 2,
  },
  treatmentChevronCircle: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexShrink: 0,
  },

  // Auto-Assign Header & Doctor Mini Card Styles
  autoAssignHeaderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    backgroundColor: "#ECFDF5",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: moderateScale(6),
    flexShrink: 0,
  },
  autoAssignPulseDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: 3,
    backgroundColor: "#10B981",
    flexShrink: 0,
  },
  autoAssignHeaderText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(10),
    color: "#059669",
    letterSpacing: 0.3,
  },
  doctorNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  matchBadgeRow: {
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    marginTop: moderateScaleVertical(4),
    marginBottom: moderateScaleVertical(4),
    maxWidth: "100%",
  },
  matchBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(10),
    color: "#059669",
  },
  doctorMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    flexWrap: "wrap",
    rowGap: moderateScaleVertical(2),
  },
  dotSeparator: {
    fontSize: textScale(12),
    color: colors.textMuted,
    flexShrink: 0,
  },
  clinicLocationText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    flex: 1,
    minWidth: 0,
  },

  // Bottom Sheets Styles
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  sheetDismissOverlay: {
    flex: 1,
  },
  modalSheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(12),
    maxHeight: "88%",
    width: "100%",
    maxWidth: 580,
    alignSelf: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetDragBar: {
    width: moderateScale(40),
    height: moderateScale(4),
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: "center",
    marginBottom: moderateScaleVertical(12),
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(14),
    gap: moderateScale(10),
  },
  sheetHeaderTitleCol: {
    flex: 1,
    minWidth: 0,
    marginRight: moderateScale(10),
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(17),
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  sheetListScroll: {
    flexShrink: 1,
  },

  // Treatment Item Card Styles
  treatmentItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(10),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  treatmentItemCardActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: "#F9FBFF",
  },
  treatmentItemLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    minWidth: 0,
    marginRight: moderateScale(8),
  },
  treatmentItemIconCircle: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(10),
    flexShrink: 0,
  },
  itemDeptRow: {
    alignSelf: "flex-start",
  },
  itemDeptText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: colors.primaryBlue,
    letterSpacing: 0.4,
  },
  itemTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13.5),
    color: colors.textPrimary,
    marginTop: 1,
  },
  itemSpecialtyText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemAutoDoctorRow: {
    marginTop: moderateScaleVertical(4),
  },
  itemAutoDoctorText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(10),
    color: "#059669",
  },
  itemRightCol: {
    alignItems: "flex-end",
    gap: moderateScale(4),
    flexShrink: 0,
  },
  itemPriceText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  itemDurationText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10),
    color: colors.textMuted,
  },
  selectionRadio: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  selectionRadioActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.primaryBlue,
  },

  // Patient Card on Screen
  switchPatientActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(9),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(8),
    gap: moderateScale(4),
  },
  switchPatientActionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11.5),
    color: colors.primaryBlue,
  },
  patientDisplayCard: {
    backgroundColor: colors.bgLight,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(18),
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(20),
  },
  patientDisplayCardOther: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFDF5",
  },
  patientTopBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(10),
  },
  patientTypePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: moderateScale(6),
  },
  patientTypePillSelf: {
    backgroundColor: "#EFF6FF",
  },
  patientTypePillOther: {
    backgroundColor: "#FEF3C7",
  },
  patientTypePillText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9.5),
    letterSpacing: 0.5,
  },
  patientTypePillTextSelf: {
    color: colors.primaryBlue,
  },
  patientTypePillTextOther: {
    color: "#B45309",
  },
  patientQuickEditBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(3),
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
  },
  patientQuickEditText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(10),
    color: colors.primaryBlue,
  },
  patientIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
  },
  patientAvatarBubble: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
    flexShrink: 0,
  },
  patientAvatarBubbleSelf: {
    backgroundColor: colors.primaryBlue,
  },
  patientAvatarBubbleOther: {
    backgroundColor: "#D97706",
  },
  patientAvatarText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
  },
  patientAvatarTextSelf: {
    color: colors.white,
  },
  patientAvatarTextOther: {
    color: colors.white,
  },
  patientIdentityMeta: {
    flex: 1,
    minWidth: 0,
  },
  patientMainName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15.5),
    color: colors.textPrimary,
  },
  patientSubLabel: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
    marginTop: 1,
  },
  patientDataGrid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: moderateScaleVertical(10),
    paddingHorizontal: moderateScale(12),
  },
  patientDataCol: {
    flex: 1,
    minWidth: 0,
  },
  patientDataColLabel: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(8.5),
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: moderateScaleVertical(2),
  },
  patientDataValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },
  patientDataValueText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11.5),
    color: colors.textPrimary,
    flex: 1,
  },
  patientDataDivider: {
    width: 1,
    height: moderateScaleVertical(24),
    backgroundColor: colors.borderLight,
    marginHorizontal: moderateScale(8),
  },
  patientCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    marginTop: moderateScaleVertical(10),
    paddingHorizontal: moderateScale(2),
  },
  patientCardFooterText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10.5),
    color: colors.primaryBlue,
    flex: 1,
  },

  // Confirmation Patient Box
  confirmPatientCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(14),
    padding: moderateScale(12),
    marginVertical: moderateScaleVertical(10),
  },
  confirmPatientTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
    marginBottom: moderateScaleVertical(3),
  },
  confirmPatientType: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9.5),
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  confirmPatientName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
  },
  confirmPatientMeta: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Patient Selection Bottom Sheet
  patientSheetContainer: {
    maxHeight: "92%",
  },
  segmentedToggleWrap: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(12),
    padding: moderateScale(4),
    marginBottom: moderateScaleVertical(14),
  },
  segmentedToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateScaleVertical(9),
    borderRadius: moderateScale(9),
    gap: moderateScale(6),
  },
  segmentedToggleBtnActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedToggleText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  segmentedToggleTextActive: {
    fontFamily: fontFamily.bold,
    color: colors.primaryBlue,
  },
  patientSheetBodyScroll: {
    flexShrink: 1,
  },
  selfTabContent: {
    paddingTop: moderateScaleVertical(4),
  },
  selfProfileCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(12),
  },
  selfCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  selfAvatarCircle: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  selfMetaCol: {
    flex: 1,
    minWidth: 0,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    marginBottom: 2,
  },
  verifiedText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: "#059669",
    letterSpacing: 0.5,
  },
  selfFullName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
    color: colors.textPrimary,
  },
  selfPhone: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    marginTop: 1,
  },
  selfDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: moderateScaleVertical(12),
  },
  selfDataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selfDataCell: {
    flex: 1,
    minWidth: 0,
  },
  selfDataLabel: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  selfDataValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.textPrimary,
  },
  infoCallout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: moderateScale(8),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(14),
  },
  infoCalloutText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(11.5),
    color: "#1E40AF",
    lineHeight: textScale(16),
  },
  sheetApplyBtn: {
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(24),
    paddingVertical: moderateScaleVertical(13),
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScaleVertical(6),
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sheetApplyBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14.5),
    color: colors.white,
  },

  // Other Person Form Styles
  otherTabContent: {
    paddingTop: moderateScaleVertical(4),
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
    marginBottom: moderateScaleVertical(12),
  },
  errorBannerText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: "#DC2626",
  },
  inputGroup: {
    marginBottom: moderateScaleVertical(14),
  },
  inputLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12.5),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(6),
  },
  requiredStar: {
    color: "#DC2626",
  },
  inputFieldBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    backgroundColor: colors.white,
    height: moderateScaleVertical(46),
    gap: moderateScale(8),
  },
  textInputField: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(13.5),
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  twoColRow: {
    flexDirection: "row",
    gap: moderateScale(10),
  },
  genderPillsRow: {
    flexDirection: "row",
    gap: moderateScale(6),
  },
  genderPill: {
    flex: 1,
    paddingVertical: moderateScaleVertical(11),
    borderRadius: moderateScale(10),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  genderPillActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: "#EFF6FF",
  },
  genderPillText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.textSecondary,
  },
  genderPillTextActive: {
    fontFamily: fontFamily.bold,
    color: colors.primaryBlue,
  },
  labelWithBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(6),
  },
  govIdTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(3),
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(4),
  },
  govIdTagText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: "#059669",
  },
  fieldHelpText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10.5),
    color: colors.textMuted,
    marginTop: moderateScaleVertical(4),
  },
  relationPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(6),
  },
  relationPill: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgLight,
  },
  relationPillActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: "#EFF6FF",
  },
  relationPillText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
  },
  relationPillTextActive: {
    fontFamily: fontFamily.bold,
    color: colors.primaryBlue,
  },
});

export default BookAppointment;
