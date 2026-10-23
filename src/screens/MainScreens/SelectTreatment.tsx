import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import NavigationStrings from "../../navigation/NavigationStrings";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";
import {
  TREATMENTS_CATALOG,
  TreatmentOption,
  getAutoAssignedDoctor,
} from "../../constants/treatments";
import ToastService from "../../services/toastService";

const CATEGORIES = [
  { id: "all", label: "All Treatments", icon: "apps-outline" },
  { id: "preventive", label: "Preventive", icon: "sparkles-outline" },
  { id: "ortho", label: "Orthodontics", icon: "medical-outline" },
  { id: "endo", label: "Root Canal", icon: "shield-checkmark-outline" },
  { id: "surgery", label: "Oral Surgery", icon: "fitness-outline" },
  { id: "cosmetic", label: "Cosmetic", icon: "happy-outline" },
];

const SelectTreatment = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isSmallDevice = windowWidth < 360;
  const preselectedName = route?.params?.selectedService;

  // Initial selection
  const initialSelected = useMemo(() => {
    if (preselectedName) {
      const match = TREATMENTS_CATALOG.find(
        (t) => t.name.toLowerCase() === preselectedName.toLowerCase()
      );
      if (match) return match;
    }
    return TREATMENTS_CATALOG[0];
  }, [preselectedName]);

  const [selectedTreatment, setSelectedTreatment] =
    useState<TreatmentOption>(initialSelected);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered treatments based on search and category
  const filteredTreatments = useMemo(() => {
    return TREATMENTS_CATALOG.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.specialtyTag.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectTreatment = (item: TreatmentOption) => {
    setSelectedTreatment(item);
  };

  const handleContinue = () => {
    const assignedDoctor = getAutoAssignedDoctor(selectedTreatment.name);
    ToastService.info(
      `Auto-assigned ${assignedDoctor.name} for ${selectedTreatment.department}`,
      "Specialist Matched ✨"
    );

    navigation.navigate(NavigationStrings.BOOK_APPOINTMENT, {
      selectedService: selectedTreatment.name,
      treatment: selectedTreatment,
      doctor: assignedDoctor,
      isAutoAssigned: true,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + moderateScaleVertical(8) },
        ]}
      >
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
              <Text style={styles.stepBadgeText}>STEP 1 OF 2</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Select Treatment
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={2}>
              Doctor will be auto-assigned based on your requirement
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateScaleVertical(110) },
        ]}
      >
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search-outline"
            size={moderateScale(19)}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search treatment, e.g. Aligners, Root Canal..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={moderateScale(18)}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Hospital Notice Banner */}
        <View style={styles.flowBanner}>
          <View style={styles.flowBannerIconBox}>
            <Ionicons
              name="medical"
              size={moderateScale(20)}
              color={colors.primaryBlue}
            />
          </View>
          <View style={styles.flowBannerTextBox}>
            <Text style={styles.flowBannerTitle}>
              Smart Clinical Auto-Assignment
            </Text>
            <Text style={styles.flowBannerDesc}>
              Pick your dental treatment below. Our hospital system will
              automatically assign the lead specialist certified in that
              department.
            </Text>
          </View>
        </View>

        {/* Category Horizontal Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.75}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  isCatActive && styles.categoryPillActive,
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={moderateScale(15)}
                  color={isCatActive ? colors.white : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    isCatActive && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Treatment List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>Available Procedures</Text>
          <Text style={styles.listHeaderCount}>
            {filteredTreatments.length} Available
          </Text>
        </View>

        {/* Treatment Items */}
        {filteredTreatments.map((treatment) => {
          const isSelected = selectedTreatment?.id === treatment.id;
          return (
            <TouchableOpacity
              key={treatment.id}
              activeOpacity={0.8}
              onPress={() => handleSelectTreatment(treatment)}
              style={[
                styles.treatmentCard,
                isSelected && styles.treatmentCardActive,
              ]}
            >
              <View style={styles.treatmentCardTop}>
                {/* Icon Circle */}
                <View
                  style={[
                    styles.treatmentIconBox,
                    isSelected && styles.treatmentIconBoxActive,
                  ]}
                >
                  {treatment.iconSet === "ion" ? (
                    <Ionicons
                      name={treatment.icon as any}
                      size={moderateScale(22)}
                      color={
                        isSelected ? colors.primaryBlue : colors.textPrimary
                      }
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={treatment.icon as any}
                      size={moderateScale(22)}
                      color={
                        isSelected ? colors.primaryBlue : colors.textPrimary
                      }
                    />
                  )}
                </View>

                {/* Info Column */}
                <View style={styles.treatmentInfoBox}>
                  <View style={styles.deptBadge}>
                    <Text style={styles.deptBadgeText} numberOfLines={1}>
                      {treatment.department.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.treatmentTitle,
                      isSelected && styles.treatmentTitleActive,
                    ]}
                    numberOfLines={2}
                  >
                    {treatment.name}
                  </Text>
                  <Text style={styles.specialtyTagText} numberOfLines={2}>
                    {treatment.specialtyTag}
                  </Text>
                </View>

                {/* Radio selection */}
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleActive,
                  ]}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={moderateScale(13)}
                      color={colors.white}
                    />
                  )}
                </View>
              </View>

              {/* Description */}
              <Text style={styles.treatmentDescText} numberOfLines={2}>
                {treatment.description}
              </Text>

              {/* Bottom Meta & Auto-Assigned Doctor Teaser */}
              <View style={styles.cardFooterDivider} />
              <View style={styles.cardFooter}>
                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Ionicons
                      name="time-outline"
                      size={moderateScale(13)}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.metaPillText}>{treatment.duration}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Ionicons
                      name="pricetag-outline"
                      size={moderateScale(13)}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.metaPillPrice}>{treatment.price}</Text>
                  </View>
                </View>

                {/* Doctor Teaser Pill */}
                <View
                  style={[
                    styles.doctorTeaserPill,
                    isSelected && styles.doctorTeaserPillActive,
                  ]}
                >
                  <Text
                    style={styles.doctorTeaserText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    ✨ Auto: {treatment.recommendedDoctorName}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Floating Bottom Bar: Continue to Auto-Assign */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, moderateScaleVertical(14)) },
        ]}
      >
        <View style={styles.bottomBarInner}>
          <View style={styles.selectionSummaryRow}>
            <View style={styles.selectionSummaryLeft}>
              <Text style={styles.summaryLabel}>Selected Procedure</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {selectedTreatment.name}
              </Text>
            </View>
            <View style={styles.summaryPriceCol}>
              <Text style={styles.summaryPriceText}>
                {selectedTreatment.price}
              </Text>
              <Text style={styles.summaryDurationText}>
                {selectedTreatment.duration}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleContinue}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>
              Continue to Specialist Match
            </Text>
            <Ionicons
              name="arrow-forward"
              size={moderateScale(18)}
              color={colors.white}
              style={{ marginLeft: moderateScale(6) }}
            />
          </TouchableOpacity>
        </View>
      </View>
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
    fontSize: textScale(11.5),
    color: colors.textSecondary,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(16),
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(10),
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: moderateScaleVertical(12),
  },
  searchIcon: {
    marginRight: moderateScale(10),
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  flowBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: moderateScale(14),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(14),
    gap: moderateScale(10),
  },
  flowBannerIconBox: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  flowBannerTextBox: {
    flex: 1,
    minWidth: 0,
  },
  flowBannerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: "#15803D",
    marginBottom: 2,
  },
  flowBannerDesc: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: "#166534",
    lineHeight: textScale(15),
  },
  categoryScroll: {
    gap: moderateScale(8),
    paddingRight: moderateScale(20),
    paddingBottom: moderateScaleVertical(14),
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    backgroundColor: colors.bgLight,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryPillActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  categoryPillText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
  },
  listHeaderTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
  },
  listHeaderCount: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textMuted,
  },
  treatmentCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(18),
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(12),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  treatmentCardActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: "#F9FBFF",
  },
  treatmentCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: moderateScale(12),
    marginBottom: moderateScaleVertical(8),
  },
  treatmentIconBox: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  treatmentIconBoxActive: {
    backgroundColor: "#EFF6FF",
  },
  treatmentInfoBox: {
    flex: 1,
    minWidth: 0,
  },
  deptBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    marginBottom: moderateScaleVertical(3),
  },
  deptBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: colors.primaryBlue,
    letterSpacing: 0.4,
  },
  treatmentTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14.5),
    color: colors.textPrimary,
  },
  treatmentTitleActive: {
    color: colors.primaryBlue,
  },
  specialtyTagText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: moderateScaleVertical(2),
  },
  radioCircleActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  treatmentDescText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
    lineHeight: textScale(16),
    marginBottom: moderateScaleVertical(10),
  },
  cardFooterDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: moderateScaleVertical(8),
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: moderateScaleVertical(6),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    flexWrap: "wrap",
    rowGap: moderateScaleVertical(4),
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },
  metaPillText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
  },
  metaPillPrice: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.textPrimary,
  },
  doctorTeaserPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3.5),
    borderRadius: moderateScale(6),
    flexShrink: 1,
    maxWidth: "100%",
  },
  doctorTeaserPillActive: {
    backgroundColor: "#ECFDF5",
  },
  doctorTeaserText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(10),
    color: "#059669",
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
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomBarInner: {
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  selectionSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(10),
  },
  selectionSummaryLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: moderateScale(10),
  },
  summaryLabel: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10.5),
    color: colors.textMuted,
  },
  summaryValue: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13.5),
    color: colors.textPrimary,
    marginTop: 1,
  },
  summaryPriceCol: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  summaryPriceText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.primaryBlue,
  },
  summaryDurationText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10.5),
    color: colors.textSecondary,
  },
  continueButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(28),
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(16),
    minHeight: moderateScaleVertical(48),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  continueButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.white,
  },
});

export default SelectTreatment;
