import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useDispatch } from "react-redux";
import { onLogout } from "../../redux/slice/authSlice";
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

const { width } = Dimensions.get("window");

const CATEGORIES = [
  {
    id: "1",
    title: "General\nDentistry",
    icon: "tooth-outline",
    iconSet: "mci",
  },
  {
    id: "2",
    title: "Teeth\nCleaning",
    icon: "sparkles-outline",
    iconSet: "ion",
  },
  { id: "3", title: "Orthodontics", icon: "tooth", iconSet: "mci" },
  {
    id: "4",
    title: "Cosmetic\nDentistry",
    icon: "emoticon-happy-outline",
    iconSet: "mci",
  },
];

const TOP_DENTISTS = [
  {
    id: "1",
    name: "Dr. Rohan Mehta",
    degree: "BDS, MDS - Orthodontist",
    rating: "4.8",
    reviewsCount: "320",
    distance: "2 km away",
    location: "SmileCare Dental Clinic, New Delhi",
    image: imagepath.dentistRohan,
  },
  {
    id: "2",
    name: "Dr. Priya Sharma",
    degree: "BDS - Cosmetic Dentist",
    rating: "4.7",
    reviewsCount: "210",
    distance: "3 km away",
    location: "DentArc Aesthetic Center, New Delhi",
    image: imagepath.dentistPriya,
  },
];

const Dashboard = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState("1");
  const [activeTab, setActiveTab] = useState<
    "home" | "appointments" | "explore" | "profile"
  >("home");
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenDoctor = (doc: any) => {
    navigation.navigate(NavigationStrings.DOCTOR_DETAIL, { doctor: doc });
  };

  const handleBookBanner = () => {
    navigation.navigate(NavigationStrings.DOCTOR_DETAIL, {
      doctor: TOP_DENTISTS[0],
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
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateScaleVertical(85) },
        ]}
      >
        {/* User Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hello, Rachna👋</Text>
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
          </View>
          <TouchableOpacity activeOpacity={0.7} style={styles.filterBtn}>
            <Ionicons
              name="options-outline"
              size={moderateScale(20)}
              color={colors.primaryBlue}
            />
          </TouchableOpacity>
        </View>

        {/* Promo Banner Card ("Healthy Teeth Happier You") */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>Healthy Teeth</Text>
            <Text style={styles.bannerTitleSub}>Happier You</Text>
            <Text style={styles.bannerDesc}>
              Get expert dental care from trusted specialists.
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
          {CATEGORIES.map((cat) => {
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
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Doctor Cards */}
        {TOP_DENTISTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => handleOpenDoctor(item)}
            style={styles.doctorCard}
          >
            <Image
              source={item.image}
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
                <Text style={styles.distanceText}> {item.distance}</Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={moderateScale(18)}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ))}


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
          onPress={() => setActiveTab("explore")}
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
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(4),
    backgroundColor: colors.primaryBlue,
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
