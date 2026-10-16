import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
  ActivityIndicator,
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
import doctorService from "../../services/doctorService";
import { Doctor, DoctorService, DoctorReview } from "../../types/models";
import { MOCK_DOCTOR_REVIEWS, MOCK_DOCTOR_SERVICES } from "../../services/mockData";

const DoctorDetail = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const doctor: Doctor = route?.params?.doctor || {
    id: "doc_01",
    name: "Dr. Rohan Mehta",
    degree: "BDS, MDS - Orthodontist",
    specialty: "Orthodontics",
    rating: "4.8",
    reviewsCount: "320",
    location: "SmileCare Dental Clinic, New Delhi",
    image: imagepath.dentistRohan,
    experienceYears: 8,
  };

  const [activeTab, setActiveTab] = useState<"about" | "services" | "reviews">("about");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [services, setServices] = useState<DoctorService[]>(MOCK_DOCTOR_SERVICES);
  const [reviews, setReviews] = useState<DoctorReview[]>(MOCK_DOCTOR_REVIEWS);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const loadDoctorMeta = async () => {
      setIsLoadingDetails(true);
      try {
        const [srvList, revList] = await Promise.all([
          doctorService.getDoctorServices(doctor.id),
          doctorService.getDoctorReviews(doctor.id),
        ]);
        setServices(srvList);
        setReviews(revList);
      } catch (e) {
        console.warn("[DoctorDetail] Failed to load doctor meta", e);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadDoctorMeta();
  }, [doctor.id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Book a consultation with ${doctor.name} (${doctor.degree}) at DentaCare!`,
      });
    } catch (e) {
      console.log("Share error", e);
    }
  };

  const handleBookNow = (serviceName?: string) => {
    navigation.navigate(NavigationStrings.BOOK_APPOINTMENT, {
      doctor,
      selectedService: serviceName || services[0]?.name || "Teeth Cleaning",
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Floating Top Navigation Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + moderateScaleVertical(8) }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.iconButton}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#EF4444" : colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={[styles.iconButton, { marginLeft: moderateScale(10) }]}
          >
            <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateScaleVertical(90) },
        ]}
      >
        {/* Doctor Hero Image with Badges */}
        <View style={styles.heroImageWrapper}>
          <Image
            source={doctor.image || imagepath.dentistRohan}
            style={styles.heroDoctorImage}
            resizeMode="cover"
          />

          {/* Video Consultation Badge */}
          <View style={styles.videoBadge}>
            <Ionicons name="play-circle" size={moderateScale(18)} color={colors.white} />
          </View>

          {/* Photos Count Badge */}
          <View style={styles.photosBadge}>
            <Ionicons name="camera-outline" size={moderateScale(13)} color={colors.white} />
            <Text style={styles.photosText}>Verified Specialist</Text>
          </View>
        </View>

        {/* Doctor Information Section */}
        <View style={styles.doctorInfoCard}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.degree}</Text>

          {/* Rating & Location Row */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={moderateScale(15)} color={colors.starYellow} />
            <Text style={styles.ratingText}>
              {" "}
              {doctor.rating} <Text style={styles.reviewsCountText}>({doctor.reviewsCount} reviews)</Text>
            </Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={moderateScale(15)} color={colors.primaryBlue} />
            <Text style={styles.locationText}> {doctor.location}</Text>
          </View>

          {/* Segmented Tab Controls */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab("about")}
              style={[styles.tabButton, activeTab === "about" && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "about" ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                About
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab("services")}
              style={[styles.tabButton, activeTab === "services" && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "services" ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Services ({services.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab("reviews")}
              style={[styles.tabButton, activeTab === "reviews" && styles.tabButtonActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "reviews" ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Reviews ({reviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content: About */}
          {activeTab === "about" && (
            <View style={styles.tabContentSection}>
              <Text style={styles.bioText}>
                {doctor.about ||
                  `${doctor.name} is a highly experienced orthodontist with over 8 years of experience in braces, aligners and smile correction treatments. Having treated over 2,500+ patients with cutting edge 3D intraoral scanners and digital precision dentistry.`}
                {!isBioExpanded && "..."}
              </Text>
              <TouchableOpacity
                onPress={() => setIsBioExpanded(!isBioExpanded)}
                activeOpacity={0.7}
                style={{ marginTop: moderateScale(4) }}
              >
                <Text style={styles.readMoreText}>
                  {isBioExpanded ? "Show less" : "Read more"}
                </Text>
              </TouchableOpacity>

              {/* Clinic Highlights */}
              <View style={styles.highlightsRow}>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightNumber}>{doctor.experienceYears || 8}+ Yrs</Text>
                  <Text style={styles.highlightLabel}>Experience</Text>
                </View>
                <View style={styles.highlightDivider} />
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightNumber}>{doctor.patientsCount || "2,500+"}</Text>
                  <Text style={styles.highlightLabel}>Smiles</Text>
                </View>
                <View style={styles.highlightDivider} />
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightNumber}>{doctor.rating} ★</Text>
                  <Text style={styles.highlightLabel}>Satisfaction</Text>
                </View>
              </View>

              {/* Services Offered Preview */}
              <Text style={styles.sectionHeading}>Services Offered</Text>
              {services.slice(0, 3).map((srv) => (
                <TouchableOpacity
                  key={srv.id}
                  activeOpacity={0.7}
                  onPress={() => handleBookNow(srv.name)}
                  style={styles.serviceRow}
                >
                  <View style={styles.serviceLeft}>
                    <View style={styles.serviceIconContainer}>
                      <MaterialCommunityIcons
                        name={(srv.icon as any) || "tooth-outline"}
                        size={moderateScale(18)}
                        color={colors.primaryBlue}
                      />
                    </View>
                    <View>
                      <Text style={styles.serviceName}>{srv.name}</Text>
                      <Text style={styles.servicePrice}>{srv.price}</Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={moderateScale(18)}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tab Content: Services */}
          {activeTab === "services" && (
            <View style={styles.tabContentSection}>
              <Text style={styles.sectionHeading}>All Treatment Services</Text>
              {services.map((srv) => (
                <TouchableOpacity
                  key={srv.id}
                  activeOpacity={0.7}
                  onPress={() => handleBookNow(srv.name)}
                  style={styles.serviceFullCard}
                >
                  <View style={styles.serviceFullHeader}>
                    <View style={styles.serviceIconContainer}>
                      <MaterialCommunityIcons
                        name={(srv.icon as any) || "tooth-outline"}
                        size={moderateScale(20)}
                        color={colors.primaryBlue}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: moderateScale(12) }}>
                      <Text style={styles.serviceName}>{srv.name}</Text>
                      <Text style={styles.servicePrice}>{srv.price} · Complete Care</Text>
                    </View>
                    <View style={styles.bookMiniTag}>
                      <Text style={styles.bookMiniText}>Book</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tab Content: Reviews */}
          {activeTab === "reviews" && (
            <View style={styles.tabContentSection}>
              <Text style={styles.sectionHeading}>Patient Feedback ({reviews.length})</Text>
              {reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{rev.author}</Text>
                    <Text style={styles.reviewDate}>{rev.date}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={moderateScale(13)}
                        color={colors.starYellow}
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, moderateScaleVertical(14)) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => handleBookNow()}
          style={styles.bookAppointmentBtn}
        >
          <Text style={styles.bookAppointmentText}>Book Appointment</Text>
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
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScaleVertical(10),
    backgroundColor: colors.white,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  iconButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.backBtnBg,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: moderateScaleVertical(30),
  },
  heroImageWrapper: {
    width: "100%",
    height: moderateScaleVertical(280),
    backgroundColor: colors.primaryBlueLight,
    position: "relative",
  },
  heroDoctorImage: {
    width: "100%",
    height: "100%",
  },
  videoBadge: {
    position: "absolute",
    top: "45%",
    left: "45%",
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  photosBadge: {
    position: "absolute",
    bottom: moderateScale(14),
    right: moderateScale(16),
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(5),
    borderRadius: moderateScale(14),
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },
  photosText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: colors.white,
  },
  doctorInfoCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    marginTop: moderateScaleVertical(-18),
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(20),
  },
  doctorName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(22),
    color: colors.textPrimary,
  },
  doctorSpecialty: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(13),
    color: colors.textSecondary,
    marginTop: moderateScaleVertical(2),
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: moderateScaleVertical(8),
  },
  ratingText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  reviewsCountText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textMuted,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: moderateScaleVertical(6),
  },
  locationText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginTop: moderateScaleVertical(18),
  },
  tabButton: {
    paddingVertical: moderateScaleVertical(12),
    marginRight: moderateScale(24),
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: colors.primaryBlue,
  },
  tabText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(14),
  },
  tabTextActive: {
    color: colors.primaryBlue,
  },
  tabTextInactive: {
    color: colors.textMuted,
  },
  tabContentSection: {
    paddingTop: moderateScaleVertical(16),
  },
  bioText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
    lineHeight: textScale(20),
  },
  readMoreText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.primaryBlue,
  },
  highlightsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    borderRadius: moderateScale(14),
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(16),
    marginVertical: moderateScaleVertical(16),
  },
  highlightItem: {
    alignItems: "center",
    flex: 1,
  },
  highlightNumber: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.primaryBlue,
  },
  highlightLabel: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 2,
  },
  highlightDivider: {
    width: 1,
    height: "70%",
    backgroundColor: colors.borderLight,
  },
  sectionHeading: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(12),
    marginTop: moderateScaleVertical(8),
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: moderateScaleVertical(10),
  },
  serviceLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceIconContainer: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(8),
    backgroundColor: colors.primaryBlueLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
  },
  serviceName: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  servicePrice: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.primaryBlue,
    marginTop: 2,
  },
  serviceFullCard: {
    backgroundColor: colors.white,
    padding: moderateScale(14),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: moderateScaleVertical(10),
  },
  serviceFullHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookMiniTag: {
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(5),
    borderRadius: moderateScale(10),
  },
  bookMiniText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  reviewCard: {
    backgroundColor: colors.bgLight,
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    marginBottom: moderateScaleVertical(10),
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewAuthor: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  reviewDate: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
  },
  reviewStars: {
    flexDirection: "row",
    marginTop: moderateScaleVertical(4),
    marginBottom: moderateScaleVertical(6),
  },
  reviewComment: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    lineHeight: textScale(18),
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  bookAppointmentBtn: {
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
  bookAppointmentText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.white,
  },
});

export default DoctorDetail;
