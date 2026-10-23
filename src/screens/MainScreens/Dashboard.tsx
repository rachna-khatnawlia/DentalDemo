import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import imagepath from "../../constants/imagepath";
import NavigationStrings from "../../navigation/NavigationStrings";
import { TREATMENTS_CATALOG, TreatmentOption } from "../../constants/treatments";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import doctorService from "../../services/doctorService";
import serviceCategoryService from "../../services/serviceCategoryService";
import patientService from "../../services/patientService";
import notificationService from "../../services/notificationService";
import appointmentService from "../../services/appointmentService";
import { Doctor, ServiceCategory, Appointment } from "../../types/models";
import ToastService from "../../services/toastService";

export interface HospitalBranch {
  id: string;
  name: string;
  area: string;
  isMainHospital: boolean;
  address: string;
  distance: string;
  phone: string;
  timings: string;
  speciality: string;
  facilities: string[];
}

export const HOSPITAL_BRANCHES: HospitalBranch[] = [
  {
    id: "branch-cp",
    name: "Central Apex Hospital (Headquarters)",
    area: "Connaught Place, New Delhi",
    isMainHospital: true,
    address: "Block C, Inner Circle, Connaught Place, New Delhi",
    distance: "0.8 km",
    phone: "+91 11 4567 8900",
    timings: "Open 24/7 · Emergency Care",
    speciality: "Super-Speciality & Trauma Care",
    facilities: ["24/7 Trauma Care", "Full 3D CBCT Scans", "General Anesthesia OT"],
  },
  {
    id: "branch-gk",
    name: "South Delhi Specialty Clinic",
    area: "Greater Kailash 1, New Delhi",
    isMainHospital: false,
    address: "M-42 Market, Greater Kailash 1, South Delhi",
    distance: "3.5 km",
    phone: "+91 11 4123 4567",
    timings: "8:00 AM - 9:00 PM",
    speciality: "Aesthetic Dentistry & Smile Designing",
    facilities: ["Teeth Whitening Lounge", "Microscopic RCT", "Digital Smile Design"],
  },
  {
    id: "branch-rajouri",
    name: "West Delhi Orthodontic Center",
    area: "Rajouri Garden, New Delhi",
    isMainHospital: false,
    address: "Main Ring Road, Near Metro Gate 2, Rajouri Garden",
    distance: "5.8 km",
    phone: "+91 11 2541 7890",
    timings: "9:00 AM - 8:30 PM",
    speciality: "Braces, Invisible Aligners & Pediatric",
    facilities: ["Clear Aligner 3D Scan", "Child Dental Bay", "Painless Extraction"],
  },
  {
    id: "branch-noida",
    name: "East NCR Implantology Center",
    area: "Sector 18, Noida",
    isMainHospital: false,
    address: "Wave Silver Tower, Sector 18, Noida, NCR",
    distance: "8.2 km",
    phone: "+91 120 488 9900",
    timings: "9:00 AM - 9:00 PM",
    speciality: "Guided Dental Implants & Laser Dentistry",
    facilities: ["CAD/CAM Same-Day Crowns", "Soft-Tissue Laser", "Full-Arch Implants"],
  },
];

export const POPULAR_SEARCHES = [
  "Dr. Rohan",
  "Dr. Sneha",
  "Teeth Cleaning",
  "Root Canal",
  "Clear Aligners",
  "Braces",
];

const { width } = Dimensions.get("window");

const Dashboard = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const reduxUser = useSelector((state: any) => state?.persisted?.auth?.user);

  // Dynamic Server State
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [patientName, setPatientName] = useState(reduxUser?.name || "Patient");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Hospital Branches State
  const [selectedBranch, setSelectedBranch] = useState<HospitalBranch>(HOSPITAL_BRANCHES[0]);
  const [showBranchModal, setShowBranchModal] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState<
    "home" | "appointments" | "explore" | "profile"
  >("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilterTab, setSearchFilterTab] = useState<"all" | "doctors" | "treatments">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Active Search State & Matching Treatments
  const isSearching = searchQuery.trim().length > 0;

  const matchingTreatments = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return TREATMENTS_CATALOG.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.specialtyTag.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.recommendedDoctorName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const totalMatches = doctors.length + matchingTreatments.length;

  // Load Initial Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      const [cats, summary, unreadCount, apt] = await Promise.all([
        serviceCategoryService.getCategories(),
        patientService.getSummary(),
        notificationService.getUnreadCount(),
        appointmentService.getUpcomingAppointment(),
      ]);

      setCategories(cats);
      if (summary?.patient?.firstName) {
        setPatientName(summary.patient.firstName);
      }
      setUpcomingAppointment(apt || summary?.upcomingAppointment || null);
      setUnreadNotifications(unreadCount);
    } catch (e) {
      console.warn("[Dashboard] Error loading dashboard summary:", e);
    }
  }, []);

  // Load Doctors with search & category filter
  const loadDoctors = useCallback(async (query: string = "") => {
    setIsLoadingDoctors(true);
    try {
      const docList = await doctorService.getDoctors({
        query,
      });
      setDoctors(docList);
    } catch (e) {
      console.warn("[Dashboard] Error loading doctors:", e);
    } finally {
      setIsLoadingDoctors(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    loadDoctors();
    const unsubscribe = appointmentService.subscribe(() => {
      loadDashboardData();
    });
    return () => unsubscribe();
  }, [loadDashboardData, loadDoctors]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      loadDoctors(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, loadDoctors]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadDashboardData(), loadDoctors(searchQuery)]);
    setIsRefreshing(false);
  };

  const handleOpenDoctor = (doc: Doctor) => {
    navigation.navigate(NavigationStrings.DOCTOR_DETAIL, { doctor: doc });
  };

  const handleBookBanner = (serviceName?: string) => {
    navigation.navigate(NavigationStrings.SELECT_TREATMENT, {
      selectedService: serviceName || "Teeth Cleaning & Scaling",
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + moderateScaleVertical(8) },
        ]}
      >
        {/* Hospital & Branch Selector */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowBranchModal(true)}
          style={styles.locationContainer}
        >
          <View style={styles.locationIconBox}>
            <Ionicons
              name="business"
              size={moderateScale(16)}
              color={colors.primaryBlue}
            />
          </View>
          <View style={styles.locationTextCol}>
            <View style={styles.locationHospitalBadge}>
              <Text style={styles.locationHospitalText}>
                {selectedBranch.isMainHospital ? "MAIN HOSPITAL" : "HOSPITAL BRANCH"}
              </Text>
            </View>
            <View style={styles.locationRowSub}>
              <Text style={styles.locationText} numberOfLines={1}>
                {selectedBranch.area}
              </Text>
              <Ionicons
                name="chevron-down"
                size={moderateScale(13)}
                color={colors.textSecondary}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Notification Bell with Badge */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.notificationBtn}
          onPress={() => navigation.navigate(NavigationStrings.NOTIFICATIONS)}
        >
          <Ionicons
            name="notifications-outline"
            size={moderateScale(22)}
            color={colors.textPrimary}
          />
          {unreadNotifications > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primaryBlue]}
            tintColor={colors.primaryBlue}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateScaleVertical(85) },
        ]}
      >
        {/* User Greeting (Hidden while searching to maximize vertical view) */}
        {!isSearching && (
          <View style={styles.greetingSection}>
            <Text style={styles.greetingTitle}>Welcome Back 👋</Text>
            <Text style={styles.greetingSubtitle}>
              How can we help you today?
            </Text>
          </View>
        )}

        {/* Search Bar with Filter Icon */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBox,
              isSearching && styles.searchBoxActive,
            ]}
          >
            <Ionicons
              name="search-outline"
              size={moderateScale(18)}
              color={isSearching ? colors.primaryBlue : colors.textMuted}
              style={{ marginRight: moderateScale(10) }}
            />
            <TextInput
              placeholder="Search doctors, treatments, clinics..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (!text.trim()) {
                  setSearchFilterTab("all");
                }
              }}
              style={styles.searchInput}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {isSearching && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchFilterTab("all");
                }}
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
        </View>

        {/* ================= CONDITION: SEARCH RESULTS VS NORMAL FEED ================= */}
        {isSearching ? (
          /* ACTIVE INLINE SEARCH RESULTS */
          <View style={styles.searchResultsContainer}>
            {/* Search Meta Header */}
            <View style={styles.searchMetaHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.searchMetaTitle} numberOfLines={1}>
                  Results for "{searchQuery}"
                </Text>
                <Text style={styles.searchMetaCount}>
                  {totalMatches} result{totalMatches === 1 ? "" : "s"} found
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchFilterTab("all");
                }}
                style={styles.searchClearBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={moderateScale(13)}
                  color={colors.primaryBlue}
                />
                <Text style={styles.searchClearBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <View style={styles.searchFilterTabsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSearchFilterTab("all")}
                style={[
                  styles.searchFilterPill,
                  searchFilterTab === "all" && styles.searchFilterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.searchFilterPillText,
                    searchFilterTab === "all" &&
                      styles.searchFilterPillTextActive,
                  ]}
                >
                  All ({totalMatches})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSearchFilterTab("doctors")}
                style={[
                  styles.searchFilterPill,
                  searchFilterTab === "doctors" && styles.searchFilterPillActive,
                ]}
              >
                <Ionicons
                  name="medical"
                  size={moderateScale(12)}
                  color={
                    searchFilterTab === "doctors"
                      ? colors.white
                      : colors.primaryBlue
                  }
                />
                <Text
                  style={[
                    styles.searchFilterPillText,
                    searchFilterTab === "doctors" &&
                      styles.searchFilterPillTextActive,
                  ]}
                >
                  Dentists ({doctors.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSearchFilterTab("treatments")}
                style={[
                  styles.searchFilterPill,
                  searchFilterTab === "treatments" &&
                    styles.searchFilterPillActive,
                ]}
              >
                <Ionicons
                  name="sparkles"
                  size={moderateScale(12)}
                  color={
                    searchFilterTab === "treatments"
                      ? colors.white
                      : colors.primaryBlue
                  }
                />
                <Text
                  style={[
                    styles.searchFilterPillText,
                    searchFilterTab === "treatments" &&
                      styles.searchFilterPillTextActive,
                  ]}
                >
                  Treatments ({matchingTreatments.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Loading Indicator */}
            {isLoadingDoctors ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={colors.primaryBlue} />
                <Text style={styles.loadingText}>Searching dentists & treatments...</Text>
              </View>
            ) : totalMatches === 0 ? (
              /* Empty Search Results with Helpful Suggestions */
              <View style={styles.emptySearchContainer}>
                <View style={styles.emptySearchIconBox}>
                  <Ionicons
                    name="search-outline"
                    size={moderateScale(32)}
                    color={colors.textMuted}
                  />
                </View>
                <Text style={styles.emptySearchTitle}>No results found</Text>
                <Text style={styles.emptySearchDesc}>
                  We couldn't find any dentists or treatments matching "{searchQuery}".
                </Text>

                <View style={styles.popularSuggestionsBox}>
                  <Text style={styles.popularSuggestionsTitle}>
                    POPULAR SEARCHES
                  </Text>
                  <View style={styles.popularTagsRow}>
                    {POPULAR_SEARCHES.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        activeOpacity={0.7}
                        onPress={() => setSearchQuery(tag)}
                        style={styles.popularTagPill}
                      >
                        <Ionicons
                          name="search"
                          size={moderateScale(11)}
                          color={colors.primaryBlue}
                        />
                        <Text style={styles.popularTagText}>{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSearchFilterTab("all");
                  }}
                  style={styles.clearSearchBtn}
                >
                  <Text style={styles.clearSearchBtnText}>Reset Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* 1. Doctors Section (when tab is "all" or "doctors") */}
                {(searchFilterTab === "all" || searchFilterTab === "doctors") &&
                  doctors.length > 0 && (
                    <View style={styles.searchSectionWrap}>
                      <View style={styles.searchSectionHeader}>
                        <Text style={styles.searchSectionTitle}>
                          Specialist Dentists ({doctors.length})
                        </Text>
                      </View>
                      {doctors.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.85}
                          onPress={() => handleOpenDoctor(item)}
                          style={styles.doctorCard}
                        >
                          <Image
                            source={item.image || imagepath.dentistRohan}
                            style={styles.doctorAvatar}
                            resizeMode="cover"
                          />
                          <View style={styles.doctorInfo}>
                            <Text style={styles.doctorName}>{item.name}</Text>
                            <Text style={styles.doctorDegree}>{item.degree}</Text>

                            <View style={styles.ratingAndDistanceRow}>
                              <View style={styles.ratingBadge}>
                                <Ionicons
                                  name="star"
                                  size={moderateScale(12)}
                                  color={colors.starYellow}
                                />
                                <Text style={styles.ratingValue}> {item.rating}</Text>
                                <Text style={styles.reviewsCount}>
                                  {" "}
                                  ({item.reviewsCount} reviews)
                                </Text>
                              </View>
                            </View>

                            <View style={styles.distanceRow}>
                              <Ionicons
                                name="location-outline"
                                size={moderateScale(12)}
                                color={colors.textSecondary}
                              />
                              <Text style={styles.distanceText}>
                                {" "}
                                {item.distance || "Near you"}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.doctorCardActionCol}>
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() => handleOpenDoctor(item)}
                              style={styles.doctorBookQuickBtn}
                            >
                              <Text style={styles.doctorBookQuickBtnText}>View</Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                {/* 2. Treatments Section (when tab is "all" or "treatments") */}
                {(searchFilterTab === "all" || searchFilterTab === "treatments") &&
                  matchingTreatments.length > 0 && (
                    <View style={styles.searchSectionWrap}>
                      <View style={styles.searchSectionHeader}>
                        <Text style={styles.searchSectionTitle}>
                          Treatments & Procedures ({matchingTreatments.length})
                        </Text>
                      </View>
                      {matchingTreatments.map((trt) => (
                        <TouchableOpacity
                          key={trt.id}
                          activeOpacity={0.85}
                          onPress={() =>
                            navigation.navigate(
                              NavigationStrings.SELECT_TREATMENT,
                              { selectedService: trt.name }
                            )
                          }
                          style={styles.treatmentSearchCard}
                        >
                          <View style={styles.treatmentSearchTop}>
                            <View style={styles.treatmentSearchIconBox}>
                              <Ionicons
                                name={
                                  trt.iconSet === "ion"
                                    ? (trt.icon as any)
                                    : "sparkles"
                                }
                                size={moderateScale(18)}
                                color={colors.primaryBlue}
                              />
                            </View>
                            <View style={styles.treatmentSearchInfo}>
                              <Text
                                style={styles.treatmentSearchTitle}
                                numberOfLines={1}
                              >
                                {trt.name}
                              </Text>
                              <Text
                                style={styles.treatmentSearchDept}
                                numberOfLines={1}
                              >
                                {trt.department}
                              </Text>
                            </View>
                            <View style={styles.treatmentSearchPriceBox}>
                              <Text style={styles.treatmentSearchPrice}>
                                {trt.price}
                              </Text>
                              <Text style={styles.treatmentSearchDuration}>
                                {trt.duration}
                              </Text>
                            </View>
                          </View>

                          <Text
                            style={styles.treatmentSearchDesc}
                            numberOfLines={2}
                          >
                            {trt.description}
                          </Text>

                          <View style={styles.treatmentSearchFooter}>
                            <View style={styles.treatmentDocTag}>
                              <Ionicons
                                name="person-circle-outline"
                                size={moderateScale(13)}
                                color={colors.textSecondary}
                              />
                              <Text
                                style={styles.treatmentDocTagText}
                                numberOfLines={1}
                              >
                                {trt.recommendedDoctorName}
                              </Text>
                            </View>
                            <View style={styles.treatmentBookBtn}>
                              <Text style={styles.treatmentBookBtnText}>
                                Book Treatment
                              </Text>
                              <Ionicons
                                name="arrow-forward"
                                size={moderateScale(12)}
                                color={colors.primaryBlue}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                {/* Tab-specific empty messages */}
                {searchFilterTab === "doctors" && doctors.length === 0 && (
                  <View style={styles.tabSpecificEmpty}>
                    <Text style={styles.tabSpecificEmptyText}>
                      No dentists match "{searchQuery}". Try viewing the Treatments tab!
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSearchFilterTab("treatments")}
                      style={styles.switchTabBtn}
                    >
                      <Text style={styles.switchTabBtnText}>
                        View Treatments ({matchingTreatments.length}) →
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {searchFilterTab === "treatments" &&
                  matchingTreatments.length === 0 && (
                    <View style={styles.tabSpecificEmpty}>
                      <Text style={styles.tabSpecificEmptyText}>
                        No treatments match "{searchQuery}". Try viewing the Dentists tab!
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSearchFilterTab("doctors")}
                        style={styles.switchTabBtn}
                      >
                        <Text style={styles.switchTabBtnText}>
                          View Dentists ({doctors.length}) →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
            )}
          </View>
        ) : (
          /* NORMAL DASHBOARD FEED */
          <View>
            {/* Upcoming Appointment Spotlight Card (if active) */}
            {upcomingAppointment && (
              <View style={styles.upcomingSpotlight}>
                <View style={styles.upcomingHeader}>
                  <View style={styles.upcomingBadge}>
                    <View style={styles.activePillDot} />
                    <Text style={styles.upcomingBadgeText}>CONFIRMED VISIT</Text>
                  </View>
                  <Text style={styles.upcomingDateText}>
                    {upcomingAppointment.scheduledDate} · {upcomingAppointment.scheduledTime}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate(NavigationStrings.DOCTOR_DETAIL, {
                      doctor: {
                        id: upcomingAppointment.doctorId,
                        name: upcomingAppointment.doctorName,
                        degree: upcomingAppointment.doctorSpecialty || "Orthodontist",
                        rating: "4.8",
                        reviewsCount: "320",
                        location: upcomingAppointment.clinicAddress,
                        image: upcomingAppointment.doctorImage || imagepath.dentistRohan,
                      },
                    })
                  }
                >
                  <Text style={styles.upcomingDoctor} numberOfLines={1}>
                    {upcomingAppointment.doctorName}
                  </Text>
                  <Text style={styles.upcomingService} numberOfLines={2}>
                    {upcomingAppointment.serviceName} · {upcomingAppointment.clinicName}
                  </Text>
                </TouchableOpacity>

                {/* Quick Actions Row */}
                <View style={styles.spotlightActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate(NavigationStrings.MY_APPOINTMENTS, {
                        initialTab: "upcoming",
                      })
                    }
                    style={styles.spotlightManageBtn}
                  >
                    <Ionicons
                      name="repeat-outline"
                      size={moderateScale(14)}
                      color={colors.primaryBlue}
                    />
                    <Text style={styles.spotlightManageBtnText} numberOfLines={1}>
                      Reschedule / Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate(NavigationStrings.MY_APPOINTMENTS, {
                        initialTab: "past",
                      })
                    }
                    style={styles.spotlightPastBtn}
                  >
                    <Text style={styles.spotlightPastBtnText} numberOfLines={1}>
                      Past Checkups →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Promo Banner Card ("Healthy Teeth Happier You") */}
            <View style={styles.bannerCard}>
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerTitle}>Healthy Teeth</Text>
                <Text style={styles.bannerTitleSub}>Happier You</Text>
                <Text style={styles.bannerDesc}>
                  Get expert dental care from verified specialists.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleBookBanner()}
                  style={styles.bannerBookBtn}
                >
                  <Text style={styles.bannerBookBtnText}>Book Appointment</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bannerRight}>
                <Image
                  source={imagepath.toothCharacter}
                  style={styles.bannerToothImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Service Categories */}
            <View style={styles.categoriesRow}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={styles.categoryItem}
                  >
                    <View
                      style={[
                        styles.categoryIconCircle,
                        isSelected && styles.categoryIconCircleActive,
                      ]}
                    >
                      {cat.iconSet === "ion" ? (
                        <Ionicons
                          name={cat.icon as any}
                          size={moderateScale(24)}
                          color={colors.primaryBlue}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={cat.icon as any}
                          size={moderateScale(24)}
                          color={colors.primaryBlue}
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.categoryTitle,
                        isSelected && styles.categoryTitleActive,
                      ]}
                    >
                      {cat.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Top Dentists Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Dentists</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => loadDoctors("")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Doctor List or Loading / Empty State */}
            {isLoadingDoctors ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={colors.primaryBlue} />
                <Text style={styles.loadingText}>Finding top specialists...</Text>
              </View>
            ) : doctors.length === 0 ? (
              <View style={styles.emptyDoctorBox}>
                <Ionicons name="search" size={moderateScale(32)} color={colors.textMuted} />
                <Text style={styles.emptyDoctorTitle}>No dentists found</Text>
                <Text style={styles.emptyDoctorSubtitle}>
                  Try searching for a different specialty or clear your filter
                </Text>
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearSearchBtn}
                >
                  <Text style={styles.clearSearchBtnText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              doctors.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => handleOpenDoctor(item)}
                  style={styles.doctorCard}
                >
                  <Image
                    source={item.image || imagepath.dentistRohan}
                    style={styles.doctorAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{item.name}</Text>
                    <Text style={styles.doctorDegree}>{item.degree}</Text>

                    <View style={styles.ratingAndDistanceRow}>
                      <View style={styles.ratingBadge}>
                        <Ionicons
                          name="star"
                          size={moderateScale(12)}
                          color={colors.starYellow}
                        />
                        <Text style={styles.ratingValue}> {item.rating}</Text>
                        <Text style={styles.reviewsCount}>
                          {" "}
                          ({item.reviewsCount} reviews)
                        </Text>
                      </View>
                    </View>

                    <View style={styles.distanceRow}>
                      <Ionicons
                        name="location-outline"
                        size={moderateScale(12)}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.distanceText}> {item.distance || "Near you"}</Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={moderateScale(18)}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomNav,
          { paddingBottom: Math.max(insets.bottom, moderateScaleVertical(10)) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab("home")}
          style={styles.navItem}
        >
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={moderateScale(22)}
            color={activeTab === "home" ? colors.primaryBlue : colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === "home"
                ? styles.navLabelActive
                : styles.navLabelInactive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            navigation.navigate(NavigationStrings.MY_APPOINTMENTS);
          }}
          style={styles.navItem}
        >
          <Ionicons
            name="calendar-outline"
            size={moderateScale(22)}
            color={colors.textMuted}
          />
          <Text style={styles.navLabelInactive}>
            Appointments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setActiveTab("explore");
            navigation.navigate(NavigationStrings.NOTIFICATIONS);
          }}
          style={styles.navItem}
        >
          <Ionicons
            name={activeTab === "explore" ? "compass" : "compass-outline"}
            size={moderateScale(22)}
            color={
              activeTab === "explore" ? colors.primaryBlue : colors.textMuted
            }
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === "explore"
                ? styles.navLabelActive
                : styles.navLabelInactive,
            ]}
          >
            Explore
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            navigation.navigate(NavigationStrings.PROFILE);
          }}
          style={styles.navItem}
        >
          <Ionicons
            name="person-outline"
            size={moderateScale(22)}
            color={colors.textMuted}
          />
          <Text style={[styles.navLabel, styles.navLabelInactive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hospital Branches Selection Modal */}
      <Modal
        visible={showBranchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBranchModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalDismissOverlay}
            activeOpacity={1}
            onPress={() => setShowBranchModal(false)}
          />
          <View
            style={[
              styles.branchModalSheet,
              {
                paddingBottom: Math.max(
                  insets.bottom,
                  moderateScaleVertical(16)
                ),
              },
            ]}
          >
            {/* Handle Drag Bar */}
            <View style={styles.modalDragBar} />

            {/* Modal Header */}
            <View style={styles.branchModalHeader}>
              <View style={styles.branchHeaderLeft}>
                <View style={styles.hospitalIconCircle}>
                  <MaterialCommunityIcons
                    name="hospital-building"
                    size={moderateScale(22)}
                    color={colors.primaryBlue}
                  />
                </View>
                <View style={styles.branchHeaderTitleCol}>
                  <Text style={styles.branchModalTitle} numberOfLines={1}>
                    Select Hospital Branch
                  </Text>
                  <Text style={styles.branchModalSubtitle} numberOfLines={2}>
                    4 branches under Apex DentaCare Hospital
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowBranchModal(false)}
                style={styles.branchModalCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Main Hospital Network Banner */}
            <View style={styles.networkBanner}>
              <View style={styles.networkBadge}>
                <View style={styles.networkPulseDot} />
                <Text style={styles.networkBadgeText}>CONNECTED HOSPITAL NETWORK</Text>
              </View>
              <Text style={styles.networkBannerText}>
                Your appointments, digital scans, and records are synced in real-time across all 4 hospital branches.
              </Text>
            </View>

            {/* Branches List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.branchListScroll}
              contentContainerStyle={{ paddingBottom: moderateScaleVertical(24) }}
            >
              {HOSPITAL_BRANCHES.map((branch) => {
                const isSelected = selectedBranch.id === branch.id;
                return (
                  <TouchableOpacity
                    key={branch.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedBranch(branch);
                      setShowBranchModal(false);
                      ToastService.info(
                        `Active branch: ${branch.name}`,
                        branch.area
                      );
                    }}
                    style={[
                      styles.branchCard,
                      isSelected && styles.branchCardSelected,
                    ]}
                  >
                    {/* Top Row: Name + Badges */}
                    <View style={styles.branchCardTopRow}>
                      <View style={styles.branchCardTitleCol}>
                        <Text
                          style={[
                            styles.branchName,
                            isSelected && styles.branchNameSelected,
                          ]}
                          numberOfLines={2}
                        >
                          {branch.name}
                        </Text>
                        <Text style={styles.branchAreaText} numberOfLines={2}>
                          📍 {branch.area}
                        </Text>
                      </View>

                      {/* Main / Distance Tag */}
                      <View style={styles.branchCardRightBadges}>
                        {branch.isMainHospital ? (
                          <View style={styles.mainHospitalTag}>
                            <Text style={styles.mainHospitalTagText}>HEADQUARTERS</Text>
                          </View>
                        ) : (
                          <View style={styles.branchDistanceTag}>
                            <Text style={styles.branchDistanceText}>
                              {branch.distance}
                            </Text>
                          </View>
                        )}

                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleSelected,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color={colors.white}
                            />
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Full Address */}
                    <Text style={styles.branchAddressText}>
                      {branch.address}
                    </Text>

                    {/* Speciality Badge */}
                    <View style={styles.specialityPill}>
                      <MaterialCommunityIcons
                        name="tooth-outline"
                        size={12}
                        color={colors.primaryBlue}
                      />
                      <Text style={styles.specialityPillText}>
                        {branch.speciality}
                      </Text>
                    </View>

                    {/* Facilities Tags */}
                    <View style={styles.facilitiesRow}>
                      {branch.facilities.map((fac, idx) => (
                        <View key={idx} style={styles.facilityPill}>
                          <Text style={styles.facilityPillText}>• {fac}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Bottom Info: Timings & Helpline */}
                    <View style={styles.branchCardFooter}>
                      <View style={styles.timingRow}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color={branch.isMainHospital ? "#16A34A" : colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.timingText,
                            branch.isMainHospital && {
                              color: "#16A34A",
                              fontFamily: fontFamily.semiBold,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {" "}{branch.timings}
                        </Text>
                      </View>
                      <View style={styles.phoneBadge}>
                        <Ionicons
                          name="call-outline"
                          size={11}
                          color={colors.primaryBlue}
                        />
                        <Text style={styles.phoneText}> {branch.phone}</Text>
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
    backgroundColor: colors.bgLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScaleVertical(10),
    backgroundColor: colors.bgLight,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    flex: 1,
    marginRight: moderateScale(12),
  },
  locationIconBox: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(10),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  locationTextCol: {
    flex: 1,
  },
  locationHospitalBadge: {
    alignSelf: "flex-start",
  },
  locationHospitalText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: colors.primaryBlue,
    letterSpacing: 0.5,
  },
  locationRowSub: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.textPrimary,
    maxWidth: "85%",
  },
  notificationBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: moderateScale(8),
    right: moderateScale(10),
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: "#EF4444",
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(10),
  },
  greetingSection: {
    marginBottom: moderateScaleVertical(16),
  },
  greetingTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(22),
    color: colors.textPrimary,
  },
  greetingSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    marginBottom: moderateScaleVertical(18),
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(48),
  },
  searchBoxActive: {
    borderColor: colors.primaryBlue,
    borderWidth: 1.5,
    backgroundColor: "#F8FAFC",
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  upcomingSpotlight: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(18),
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(6),
  },
  upcomingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: moderateScale(10),
    gap: moderateScale(5),
  },
  activePillDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: colors.primaryBlue,
  },
  upcomingBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(10),
    color: colors.primaryBlue,
    letterSpacing: 0.4,
  },
  upcomingDateText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
  },
  upcomingDoctor: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
  },
  upcomingService: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: moderateScaleVertical(10),
  },
  spotlightActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: moderateScale(8),
    rowGap: moderateScaleVertical(6),
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: moderateScaleVertical(10),
  },
  spotlightManageBtn: {
    flex: 1,
    minWidth: moderateScale(130),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(5),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(6),
    borderRadius: moderateScale(10),
  },
  spotlightManageBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  spotlightPastBtn: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(8),
  },
  spotlightPastBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.textSecondary,
  },
  bannerCard: {
    backgroundColor: colors.bannerBg,
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: colors.bannerBorder,
    padding: moderateScale(18),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: moderateScaleVertical(22),
    overflow: "hidden",
  },
  bannerLeft: {
    flex: 1.2,
  },
  bannerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(17),
    color: colors.textPrimary,
    lineHeight: textScale(22),
  },
  bannerTitleSub: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(17),
    color: colors.primaryBlue,
    lineHeight: textScale(22),
  },
  bannerDesc: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: moderateScaleVertical(6),
    lineHeight: 16,
  },
  bannerBookBtn: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(9),
    borderRadius: moderateScale(20),
    alignSelf: "flex-start",
    marginTop: moderateScaleVertical(12),
  },
  bannerBookBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.white,
  },
  bannerRight: {
    flex: 0.9,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerToothImage: {
    width: moderateScale(110),
    height: moderateScale(110),
  },
  categoriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: moderateScaleVertical(24),
  },
  categoryItem: {
    alignItems: "center",
    width: (width - moderateScale(40)) / 4.2,
  },
  categoryIconCircle: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScaleVertical(8),
  },
  categoryIconCircleActive: {
    backgroundColor: colors.primaryBlueLight,
    borderColor: colors.primaryBlue,
  },
  categoryTitle: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: textScale(14),
  },
  categoryTitleActive: {
    fontFamily: fontFamily.semiBold,
    color: colors.primaryBlue,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(14),
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(17),
    color: colors.textPrimary,
  },
  seeAllText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.primaryBlue,
  },
  loadingBox: {
    paddingVertical: moderateScaleVertical(30),
    alignItems: "center",
    gap: moderateScale(8),
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textMuted,
  },
  emptyDoctorBox: {
    paddingVertical: moderateScaleVertical(30),
    alignItems: "center",
    gap: moderateScale(6),
  },
  emptyDoctorTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
  },
  emptyDoctorSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textMuted,
    textAlign: "center",
  },
  clearSearchBtn: {
    marginTop: moderateScaleVertical(8),
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(14),
  },
  clearSearchBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.primaryBlue,
  },
  // Active Search Styles
  searchResultsContainer: {
    paddingBottom: moderateScaleVertical(20),
  },
  searchMetaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
  },
  searchMetaTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
  },
  searchMetaCount: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchClearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(12),
  },
  searchClearBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  searchFilterTabsRow: {
    flexDirection: "row",
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(16),
  },
  searchFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(14),
  },
  searchFilterPillActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  searchFilterPillText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
  },
  searchFilterPillTextActive: {
    color: colors.white,
  },
  searchSectionWrap: {
    marginBottom: moderateScaleVertical(18),
  },
  searchSectionHeader: {
    marginBottom: moderateScaleVertical(10),
  },
  searchSectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13.5),
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  treatmentSearchCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(10),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  treatmentSearchTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    marginBottom: moderateScaleVertical(8),
  },
  treatmentSearchIconBox: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(10),
    backgroundColor: colors.primaryBlueLight,
    justifyContent: "center",
    alignItems: "center",
  },
  treatmentSearchInfo: {
    flex: 1,
  },
  treatmentSearchTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13.5),
    color: colors.textPrimary,
  },
  treatmentSearchDept: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 1,
  },
  treatmentSearchPriceBox: {
    alignItems: "flex-end",
  },
  treatmentSearchPrice: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13.5),
    color: colors.primaryBlue,
  },
  treatmentSearchDuration: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10),
    color: colors.textMuted,
  },
  treatmentSearchDesc: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: moderateScaleVertical(10),
  },
  treatmentSearchFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: moderateScaleVertical(8),
  },
  treatmentDocTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    flex: 1,
    marginRight: moderateScale(8),
  },
  treatmentDocTagText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(10.5),
    color: colors.textSecondary,
  },
  treatmentBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4.5),
    borderRadius: moderateScale(8),
  },
  treatmentBookBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  doctorCardActionCol: {
    marginLeft: moderateScale(8),
    justifyContent: "center",
  },
  doctorBookQuickBtn: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(10),
  },
  doctorBookQuickBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  emptySearchContainer: {
    paddingVertical: moderateScaleVertical(28),
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: moderateScale(20),
    marginTop: moderateScaleVertical(4),
  },
  emptySearchIconBox: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
  },
  emptySearchTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(4),
  },
  emptySearchDesc: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: moderateScaleVertical(16),
  },
  popularSuggestionsBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(14),
  },
  popularSuggestionsTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(10),
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: moderateScaleVertical(8),
  },
  popularTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(6),
  },
  popularTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: moderateScale(9),
    paddingVertical: moderateScaleVertical(5),
    borderRadius: moderateScale(8),
  },
  popularTagText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  tabSpecificEmpty: {
    paddingVertical: moderateScaleVertical(20),
    alignItems: "center",
    gap: moderateScale(8),
  },
  tabSpecificEmptyText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textMuted,
    textAlign: "center",
  },
  switchTabBtn: {
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(12),
  },
  switchTabBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11.5),
    color: colors.primaryBlue,
  },
  doctorCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: moderateScale(14),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  doctorAvatar: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(14),
  },
  doctorInfo: {
    flex: 1,
    marginLeft: moderateScale(14),
  },
  doctorName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.textPrimary,
  },
  doctorDegree: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingAndDistanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: moderateScaleVertical(4),
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11),
    color: colors.textPrimary,
  },
  reviewsCount: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  distanceText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: moderateScaleVertical(8),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navLabel: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(10),
    marginTop: moderateScaleVertical(3),
  },
  navLabelActive: {
    color: colors.primaryBlue,
    fontFamily: fontFamily.semiBold,
  },
  navLabelInactive: {
    color: colors.textMuted,
  },

  // Hospital Branches Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalDismissOverlay: {
    flex: 1,
  },
  branchModalSheet: {
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
  modalDragBar: {
    width: moderateScale(40),
    height: moderateScale(4),
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: "center",
    marginBottom: moderateScaleVertical(12),
  },
  branchModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
    gap: moderateScale(10),
  },
  branchHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
    flex: 1,
    minWidth: 0,
  },
  hospitalIconCircle: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  branchHeaderTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  branchModalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(17),
    color: colors.textPrimary,
  },
  branchModalSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 1,
  },
  branchModalCloseBtn: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  networkBanner: {
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(14),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(12),
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    marginBottom: moderateScaleVertical(3),
  },
  networkPulseDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  networkBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(10),
    color: "#059669",
    letterSpacing: 0.5,
  },
  networkBannerText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    lineHeight: textScale(15),
  },
  branchListScroll: {
    flexShrink: 1,
  },
  branchCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(18),
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(10),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  branchCardSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: "#F9FBFF",
  },
  branchCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(6),
  },
  branchCardTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  branchName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.textPrimary,
    lineHeight: textScale(18),
  },
  branchNameSelected: {
    color: colors.primaryBlue,
  },
  branchAreaText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 2,
  },
  branchCardRightBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    flexShrink: 0,
  },
  mainHospitalTag: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexShrink: 0,
  },
  mainHospitalTagText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(8.5),
    color: "#B45309",
    letterSpacing: 0.4,
  },
  branchDistanceTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    flexShrink: 0,
  },
  branchDistanceText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(9.5),
    color: colors.textSecondary,
  },
  radioCircle: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  radioCircleSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.primaryBlue,
  },
  branchAddressText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    lineHeight: textScale(16),
    marginBottom: moderateScaleVertical(7),
  },
  specialityPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: moderateScale(5),
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: moderateScale(8),
    marginBottom: moderateScaleVertical(7),
    flexShrink: 1,
  },
  specialityPillText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(10.5),
    color: colors.primaryBlue,
  },
  facilitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(5),
    marginBottom: moderateScaleVertical(9),
  },
  facilityPill: {
    backgroundColor: colors.bgLight,
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScaleVertical(2.5),
    borderRadius: moderateScale(6),
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  facilityPillText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(9.5),
    color: colors.textMuted,
  },
  branchCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: moderateScaleVertical(6),
    paddingTop: moderateScaleVertical(8),
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  timingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: moderateScale(6),
  },
  timingText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(10.5),
    color: colors.textSecondary,
  },
  phoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    flexShrink: 0,
  },
  phoneText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(10.5),
    color: colors.primaryBlue,
  },
});

export default Dashboard;
