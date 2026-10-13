import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

const Profile = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    dispatch(onLogout());
  };

  const handleOpenDoctor = () => {
    navigation.navigate(NavigationStrings.DOCTOR_DETAIL, {
      doctor: {
        name: "Dr. Rohan Mehta",
        degree: "BDS, MDS - Orthodontist",
        rating: "4.8",
        reviewsCount: "320",
        location: "SmileCare Dental Clinic, New Delhi",
        image: imagepath.dentistRohan,
      },
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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert("Profile", "Rachna's profile is up to date.")
          }
          style={styles.headerBtn}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={colors.primaryBlue}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateScaleVertical(40) },
        ]}
      >
        {/* User Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={imagepath.userArjun}
              style={styles.avatarImage}
              resizeMode="cover"
            />
            <View style={styles.cameraBadge}>
              <Ionicons
                name="camera"
                size={moderateScale(12)}
                color={colors.white}
              />
            </View>
          </View>

          <Text style={styles.userName}>Rachna</Text>
          <Text style={styles.userEmail}>rachna@example.com</Text>

          <View style={styles.phoneLocationRow}>
            <Text style={styles.userPhone}>+91 98765 43210</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <View style={styles.locationBadge}>
              <Ionicons
                name="location-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={styles.userLocation}> New Delhi</Text>
            </View>
          </View>

          {/* Platinum Membership Badge */}
          <View style={styles.memberBadge}>
            <Ionicons
              name="shield-checkmark"
              size={moderateScale(14)}
              color={colors.primaryBlue}
            />
            <Text style={styles.memberBadgeText}>
              DentaCare Platinum Patient
            </Text>
          </View>
        </View>

        {/* Dental Stats Tiles Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statTile}>
            <View
              style={[styles.statIconCircle, { backgroundColor: "#EBF5FF" }]}
            >
              <MaterialCommunityIcons
                name="tooth-outline"
                size={moderateScale(18)}
                color={colors.primaryBlue}
              />
            </View>
            <Text numberOfLines={1} style={styles.statValue}>
              6 Oct
            </Text>
            <Text numberOfLines={1} style={styles.statLabel}>
              Next Visit
            </Text>
          </View>

          <View style={styles.statTile}>
            <View
              style={[styles.statIconCircle, { backgroundColor: "#ECFDF5" }]}
            >
              <Ionicons
                name="checkmark-done"
                size={moderateScale(18)}
                color="#10B981"
              />
            </View>
            <Text numberOfLines={1} style={styles.statValue}>
              4 Visits
            </Text>
            <Text numberOfLines={1} style={styles.statLabel}>
              Completed
            </Text>
          </View>

          <View style={styles.statTile}>
            <View
              style={[styles.statIconCircle, { backgroundColor: "#FEF3C7" }]}
            >
              <Ionicons
                name="shield-outline"
                size={moderateScale(18)}
                color="#F59E0B"
              />
            </View>
            <Text numberOfLines={1} style={styles.statValue}>
              Active
            </Text>
            <Text numberOfLines={1} style={styles.statLabel}>
              Insurance
            </Text>
          </View>

          <View style={styles.statTile}>
            <View
              style={[styles.statIconCircle, { backgroundColor: "#F3E8FF" }]}
            >
              <Ionicons
                name="sparkles-outline"
                size={moderateScale(18)}
                color="#8B5CF6"
              />
            </View>
            <Text numberOfLines={1} style={styles.statValue}>
              450 Pts
            </Text>
            <Text numberOfLines={1} style={styles.statLabel}>
              Rewards
            </Text>
          </View>
        </View>

        {/* Upcoming Appointment Spotlight Card */}
        <View style={styles.appointmentSpotlightCard}>
          <View style={styles.spotlightHeader}>
            <View style={styles.spotlightTag}>
              <View style={styles.activeDot} />
              <Text style={styles.spotlightTagText}>UPCOMING APPOINTMENT</Text>
            </View>
            <Text style={styles.spotlightDate}>In 5 Days</Text>
          </View>

          <View style={styles.spotlightDoctorRow}>
            <Image
              source={imagepath.dentistRohan}
              style={styles.spotlightDoctorImg}
              resizeMode="cover"
            />
            <View style={styles.spotlightDoctorInfo}>
              <Text style={styles.spotlightDoctorName}>Dr. Rohan Mehta</Text>
              <Text style={styles.spotlightDoctorSpecialty}>
                BDS, MDS - Orthodontist
              </Text>
              <Text style={styles.spotlightService}>
                🦷 Teeth Cleaning & Assessment
              </Text>
            </View>
          </View>

          <View style={styles.spotlightTimeLocationRow}>
            <View style={styles.timeBadge}>
              <Ionicons
                name="time-outline"
                size={13}
                color={colors.primaryBlue}
              />
              <Text style={styles.timeBadgeText}> Mon, 6 Oct · 10:00 AM</Text>
            </View>
            <View style={styles.clinicBadge}>
              <Ionicons
                name="location-outline"
                size={13}
                color={colors.textSecondary}
              />
              <Text style={styles.clinicBadgeText}> SmileCare Clinic</Text>
            </View>
          </View>

          <View style={styles.spotlightActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenDoctor}
              style={styles.spotlightViewBtn}
            >
              <Text style={styles.spotlightViewText}>View Doctor Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  "Directions",
                  "SmileCare Dental Clinic, 2nd Floor, Connaught Place, New Delhi.",
                )
              }
              style={styles.spotlightDirectionsBtn}
            >
              <Ionicons
                name="navigate-outline"
                size={14}
                color={colors.textPrimary}
              />
              <Text style={styles.spotlightDirectionsText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Medical Records & Healthcare */}
        <Text style={styles.sectionTitle}>Dental Health & Records</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Dental Records",
                "3 prescriptions and dental notes on file.",
              )
            }
            style={styles.menuRow}
          >
            <View style={styles.menuRowLeft}>
              <View
                style={[styles.menuIconBox, { backgroundColor: "#EBF5FF" }]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={moderateScale(18)}
                  color={colors.primaryBlue}
                />
              </View>
              <View>
                <Text style={styles.menuRowTitle}>
                  Dental History & Prescriptions
                </Text>
                <Text style={styles.menuRowSubtitle}>
                  View past checkups & notes
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "X-Ray Scans",
                "Full-mouth panoramic OPG scan (Jan 2026) verified.",
              )
            }
            style={styles.menuRow}
          >
            <View style={styles.menuRowLeft}>
              <View
                style={[styles.menuIconBox, { backgroundColor: "#F0FDF4" }]}
              >
                <MaterialCommunityIcons
                  name="radiology-box"
                  size={moderateScale(18)}
                  color="#16A34A"
                />
              </View>
              <View>
                <Text style={styles.menuRowTitle}>
                  Digital X-Rays & 3D Scans
                </Text>
                <Text style={styles.menuRowSubtitle}>
                  2 Intraoral scans uploaded
                </Text>
              </View>
            </View>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>2 Scans</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Insurance",
                "Policy #SG-99420 active under SmileGuard Health.",
              )
            }
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
          >
            <View style={styles.menuRowLeft}>
              <View
                style={[styles.menuIconBox, { backgroundColor: "#FEF2F2" }]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={moderateScale(18)}
                  color="#DC2626"
                />
              </View>
              <View>
                <Text style={styles.menuRowTitle}>Dental Insurance Card</Text>
                <Text style={styles.menuRowSubtitle}>
                  SmileGuard · 80% coverage
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Section: Settings & Preferences */}
        <Text style={styles.sectionTitle}>Preferences & Support</Text>
        <View style={styles.cardGroup}>
          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <View
                style={[styles.menuIconBox, { backgroundColor: "#F1F5F9" }]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={moderateScale(18)}
                  color={colors.textPrimary}
                />
              </View>
              <View>
                <Text style={styles.menuRowTitle}>Appointment Reminders</Text>
                <Text style={styles.menuRowSubtitle}>
                  Receive SMS & Push alerts
                </Text>
              </View>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{
                false: colors.borderLight,
                true: colors.primaryBlue,
              }}
              thumbColor={colors.white}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowEmergencyModal(true)}
            style={styles.menuRow}
          >
            <View style={styles.menuRowLeft}>
              <View
                style={[styles.menuIconBox, { backgroundColor: "#FEF2F2" }]}
              >
                <Ionicons
                  name="call-outline"
                  size={moderateScale(18)}
                  color="#EF4444"
                />
              </View>
              <View>
                <Text style={[styles.menuRowTitle, { color: "#EF4444" }]}>
                  24/7 Dental Emergency Helpline
                </Text>
                <Text style={styles.menuRowSubtitle}>
                  Immediate assistance for acute tooth pain
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Support",
                "Need help? Email us at support@dentacare.com",
              )
            }
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
          >
            <View style={styles.menuRowLeft}>
              <View
                style={[styles.menuIconBox, { backgroundColor: "#F1F5F9" }]}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={moderateScale(18)}
                  color={colors.textSecondary}
                />
              </View>
              <View>
                <Text style={styles.menuRowTitle}>Help Center & FAQ</Text>
                <Text style={styles.menuRowSubtitle}>
                  Care guides and billing questions
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowLogoutModal(true)}
          style={styles.logoutButton}
        >
          <Ionicons
            name="log-out-outline"
            size={moderateScale(18)}
            color="#DC2626"
          />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.versionFooter}>
          DentaCare Mobile v1.0.0 · HIPAA & ISO Accredited
        </Text>
      </ScrollView>

      {/* Emergency Helpline Modal */}
      <Modal visible={showEmergencyModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View
              style={[styles.modalIconCircle, { backgroundColor: "#FEE2E2" }]}
            >
              <Ionicons
                name="medical"
                size={moderateScale(32)}
                color="#DC2626"
              />
            </View>
            <Text style={styles.modalTitle}>Dental Emergency Hotline</Text>
            <Text style={styles.modalDesc}>
              In case of severe bleeding, chipped tooth, or acute tooth pain,
              our emergency dentists are available 24/7.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setShowEmergencyModal(false);
                Alert.alert(
                  "Calling Emergency...",
                  "Dialing 1800-DENTACARE (toll-free)",
                );
              }}
              style={styles.emergencyCallBtn}
            >
              <Ionicons name="call" size={18} color={colors.white} />
              <Text style={styles.emergencyCallText}>Call 1800-DENTACARE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowEmergencyModal(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View
              style={[styles.modalIconCircle, { backgroundColor: "#FEE2E2" }]}
            >
              <Ionicons
                name="log-out"
                size={moderateScale(30)}
                color="#DC2626"
              />
            </View>
            <Text style={styles.modalTitle}>Log Out of DentaCare?</Text>
            <Text style={styles.modalDesc}>
              You will need to sign in again with your mobile number to view
              appointments.
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowLogoutModal(false)}
                style={styles.modalCancelHalfBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogoutConfirm}
                style={styles.modalLogoutHalfBtn}
              >
                <Text style={styles.modalLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: moderateScaleVertical(12),
    backgroundColor: colors.bgLight,
  },
  headerBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(14),
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(8),
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(22),
    padding: moderateScale(20),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: moderateScaleVertical(16),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: moderateScaleVertical(12),
  },
  avatarImage: {
    width: moderateScale(84),
    height: moderateScale(84),
    borderRadius: moderateScale(42),
    borderWidth: 3,
    borderColor: colors.primaryBlueLight,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: colors.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(20),
    color: colors.textPrimary,
  },
  userEmail: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    marginTop: 2,
  },
  phoneLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: moderateScaleVertical(6),
    gap: moderateScale(6),
  },
  userPhone: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.textPrimary,
  },
  dotSeparator: {
    color: colors.textMuted,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  userLocation: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(20),
    marginTop: moderateScaleVertical(14),
    borderWidth: 1,
    borderColor: colors.bannerBorder,
  },
  memberBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScaleVertical(18),
  },
  statTile: {
    width: "23%",
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(6),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconCircle: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScaleVertical(6),
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11),
    color: colors.textPrimary,
    textAlign: "center",
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(9.5),
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },

  appointmentSpotlightCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    borderWidth: 1.5,
    borderColor: colors.bannerBorder,
    marginBottom: moderateScaleVertical(22),
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  spotlightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
  },
  spotlightTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(10),
  },
  activeDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: colors.primaryBlue,
  },
  spotlightTagText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: colors.primaryBlue,
    letterSpacing: 0.5,
  },
  spotlightDate: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  spotlightDoctorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotlightDoctorImg: {
    width: moderateScale(54),
    height: moderateScale(54),
    borderRadius: moderateScale(14),
  },
  spotlightDoctorInfo: {
    flex: 1,
    marginLeft: moderateScale(12),
  },
  spotlightDoctorName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.textPrimary,
  },
  spotlightDoctorSpecialty: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 1,
  },
  spotlightService: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
    marginTop: 3,
  },
  spotlightTimeLocationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(8),
    marginTop: moderateScaleVertical(12),
    paddingVertical: moderateScaleVertical(8),
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(8),
  },
  timeBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: colors.textPrimary,
  },
  clinicBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(8),
  },
  clinicBadgeText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
  },
  spotlightActionsRow: {
    flexDirection: "row",
    gap: moderateScale(10),
    marginTop: moderateScaleVertical(12),
  },
  spotlightViewBtn: {
    flex: 1.4,
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
    alignItems: "center",
    justifyContent: "center",
  },
  spotlightViewText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.white,
  },
  spotlightDirectionsBtn: {
    flex: 1,
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(4),
  },
  spotlightDirectionsText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(10),
    marginTop: moderateScaleVertical(4),
  },
  cardGroup: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: moderateScale(14),
    marginBottom: moderateScaleVertical(18),
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScaleVertical(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
    flex: 1,
  },
  menuIconBox: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  menuRowTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  menuRowSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
    marginTop: 1,
  },
  newBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: moderateScale(8),
  },
  newBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(10),
    color: "#16A34A",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: moderateScale(16),
    paddingVertical: moderateScaleVertical(14),
    marginTop: moderateScaleVertical(6),
  },
  logoutButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: "#DC2626",
  },
  versionFooter: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: moderateScaleVertical(18),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(24),
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: moderateScale(24),
    padding: moderateScale(22),
    alignItems: "center",
  },
  modalIconCircle: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
  },
  modalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    color: colors.textPrimary,
    textAlign: "center",
  },
  modalDesc: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: textScale(19),
    marginVertical: moderateScaleVertical(10),
  },
  emergencyCallBtn: {
    width: "100%",
    backgroundColor: "#DC2626",
    borderRadius: moderateScale(16),
    paddingVertical: moderateScaleVertical(13),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
    marginTop: moderateScaleVertical(6),
  },
  emergencyCallText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.white,
  },
  modalCancelBtn: {
    marginTop: moderateScaleVertical(10),
    paddingVertical: moderateScaleVertical(6),
  },
  modalCancelText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  modalButtonGroup: {
    flexDirection: "row",
    gap: moderateScale(12),
    marginTop: moderateScaleVertical(14),
    width: "100%",
  },
  modalCancelHalfBtn: {
    flex: 1,
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(14),
    paddingVertical: moderateScaleVertical(12),
    alignItems: "center",
  },
  modalLogoutHalfBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: moderateScale(14),
    paddingVertical: moderateScaleVertical(12),
    alignItems: "center",
  },
  modalLogoutText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.white,
  },
});

export default Profile;
