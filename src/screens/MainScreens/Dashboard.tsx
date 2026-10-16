import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import imagepath from "../../constants/imagepath";
import NavigationStrings from "../../navigation/NavigationStrings";
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
import { Doctor, ServiceCategory, Appointment } from "../../types/models";

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

  // UI State
  const [activeTab, setActiveTab] = useState<
    "home" | "appointments" | "explore" | "profile"
  >("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Load Initial Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      const [cats, summary, unreadCount] = await Promise.all([
        serviceCategoryService.getCategories(),
        patientService.getSummary(),
        notificationService.getUnreadCount(),
      ]);

      setCategories(cats);
      if (summary?.patient?.firstName) {
        setPatientName(summary.patient.firstName);
      }
      setUpcomingAppointment(summary?.upcomingAppointment || null);
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

  const handleBookBanner = () => {
    if (doctors.length > 0) {
      navigation.navigate(NavigationStrings.DOCTOR_DETAIL, {
        doctor: doctors[0],
      });
    } else {
      navigation.navigate(NavigationStrings.BOOK_APPOINTMENT, {
        selectedService: "Teeth Cleaning",
      });
    }
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
        {/* Location Picker */}
        <TouchableOpacity activeOpacity={0.7} style={styles.locationContainer}>
          <Ionicons
            name="location"
            size={moderateScale(18)}
            color={colors.primaryBlue}
          />
          <Text style={styles.locationText}>New Delhi</Text>
          <Ionicons
            name="chevron-down"
            size={moderateScale(14)}
            color={colors.textPrimary}
          />
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
        {/* User Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Welcome Back 👋</Text>
          <Text style={styles.greetingSubtitle}>
            How can we help you today?
          </Text>
        </View>

        {/* Search Bar with Filter Icon */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={moderateScale(18)}
              color={colors.textMuted}
              style={{ marginRight: moderateScale(10) }}
            />
            <TextInput
              placeholder="Search doctors, treatments..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={moderateScale(18)}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity activeOpacity={0.7} style={styles.filterBtn}>
            <Ionicons
              name="options-outline"
              size={moderateScale(20)}
              color={colors.primaryBlue}
            />
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointment Spotlight Card (if active) */}
        {upcomingAppointment && (
          <TouchableOpacity
            activeOpacity={0.88}
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
            style={styles.upcomingSpotlight}
          >
            <View style={styles.upcomingHeader}>
              <View style={styles.upcomingBadge}>
                <View style={styles.activePillDot} />
                <Text style={styles.upcomingBadgeText}>CONFIRMED VISIT</Text>
              </View>
              <Text style={styles.upcomingDateText}>
                {upcomingAppointment.scheduledDate} · {upcomingAppointment.scheduledTime}
              </Text>
            </View>
            <Text style={styles.upcomingDoctor}>
              {upcomingAppointment.doctorName}
            </Text>
            <Text style={styles.upcomingService}>
              {upcomingAppointment.serviceName} · {upcomingAppointment.clinicName}
            </Text>
          </TouchableOpacity>
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
              onPress={handleBookBanner}
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
            setActiveTab("appointments");
            handleBookBanner();
          }}
          style={styles.navItem}
        >
          <Ionicons
            name={
              activeTab === "appointments" ? "calendar" : "calendar-outline"
            }
            size={moderateScale(22)}
            color={
              activeTab === "appointments"
                ? colors.primaryBlue
                : colors.textMuted
            }
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === "appointments"
                ? styles.navLabelActive
                : styles.navLabelInactive,
            ]}
          >
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
    gap: moderateScale(4),
  },
  locationText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.textPrimary,
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
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  filterBtn: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(14),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
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
});

export default Dashboard;
