import React, { useState, useEffect, useCallback } from "react";
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
  RefreshControl,
  ActivityIndicator,
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
import StatusBadge from "../../components/StatusBadge";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";
import patientService from "../../services/patientService";
import notificationService from "../../services/notificationService";
import authService from "../../services/authService";
import { PatientProfile, Appointment } from "../../types/models";
import { MOCK_PATIENT_PROFILE, MOCK_UPCOMING_APPOINTMENT } from "../../services/mockData";
import ToastService from "../../services/toastService";

const Profile = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  // Dynamic Server State
  const [profile, setProfile] = useState<PatientProfile>(MOCK_PATIENT_PROFILE);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(MOCK_UPCOMING_APPOINTMENT);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const loadProfileData = useCallback(async () => {
    try {
      const [profData, summaryData, prefs] = await Promise.all([
        patientService.getProfile(),
        patientService.getSummary(),
        notificationService.getPreferences(),
      ]);

      setProfile(profData);
      setUpcomingAppointment(summaryData?.upcomingAppointment || null);
      setRemindersEnabled(prefs.appointmentReminders);
    } catch (e) {
      console.warn("[Profile] Error loading profile data", e);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadProfileData();
    setIsRefreshing(false);
  };

  const handleToggleReminders = async (value: boolean) => {
    setRemindersEnabled(value);
    ToastService.info(
      value ? "Appointment reminders enabled" : "Appointment reminders disabled",
      "Notifications"
    );
    try {
      await notificationService.updatePreferences({ appointmentReminders: value });
    } catch (e) {
      console.warn("[Profile] Failed to update reminder preference", e);
    }
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (e) {
      console.warn("[Profile] Logout error", e);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      ToastService.info("You have been signed out.", "Logged Out");
      dispatch(onLogout());
    }
  };

  const handleOpenDoctor = () => {
    if (upcomingAppointment) {
      navigation.navigate(NavigationStrings.DOCTOR_DETAIL, {
        doctor: {
          id: upcomingAppointment.doctorId,
          name: upcomingAppointment.doctorName,
          degree: upcomingAppointment.doctorSpecialty || "BDS, MDS - Orthodontist",
          rating: "4.8",
          reviewsCount: "320",
          location: upcomingAppointment.clinicAddress,
          image: upcomingAppointment.doctorImage || imagepath.dentistRohan,
        },
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
          onPress={() => navigation.navigate(NavigationStrings.EDIT_PROFILE)}
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
          { paddingBottom: insets.bottom + moderateScaleVertical(40) },
        ]}
      >
        {/* User Hero Card */}
        <View style={styles.heroCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate(NavigationStrings.EDIT_PROFILE)}
            style={styles.avatarContainer}
          >
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
          </TouchableOpacity>

          <Text style={styles.userName}>{profile.firstName} {profile.lastName}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>

          <View style={styles.phoneLocationRow}>
            <Text style={styles.userPhone}>•••• •••• ••</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <View style={styles.locationBadge}>
              <Ionicons
                name="location-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={styles.userLocation}> {profile.city}</Text>
            </View>
          </View>

          {/* Membership Badge */}
          <View style={styles.memberBadge}>
            <Ionicons
              name="shield-checkmark"
              size={moderateScale(14)}
              color={colors.primaryBlue}
            />
            <Text style={styles.memberBadgeText}>
              DentaCare {profile.membershipTier} Patient
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
              {upcomingAppointment ? upcomingAppointment.scheduledDate.slice(5) : "None"}
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
              {profile.visitsCount} Visits
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
              {profile.insurancePolicyNumber ? "Active" : "None"}
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
              {profile.rewardPoints} Pts
            </Text>
            <Text numberOfLines={1} style={styles.statLabel}>
              Rewards
            </Text>
          </View>
        </View>

        {/* Upcoming Appointment Spotlight Card */}
        {upcomingAppointment && (
          <View style={styles.appointmentSpotlightCard}>
            <View style={styles.spotlightHeader}>
              <View style={styles.spotlightTag}>
                <View style={styles.activeDot} />
                <Text style={styles.spotlightTagText}>UPCOMING APPOINTMENT</Text>
              </View>
              <Text style={styles.spotlightDate}>Confirmed</Text>
            </View>

            <View style={styles.spotlightDoctorRow}>
              <Image
                source={upcomingAppointment.doctorImage || imagepath.dentistRohan}
                style={styles.spotlightDoctorImg}
                resizeMode="cover"
              />
              <View style={styles.spotlightDoctorInfo}>
                <Text style={styles.spotlightDoctorName}>{upcomingAppointment.doctorName}</Text>
                <Text style={styles.spotlightDoctorSpecialty}>
                  {upcomingAppointment.doctorSpecialty || "Orthodontist"}
                </Text>
                <Text style={styles.spotlightService}>
                  🦷 {upcomingAppointment.serviceName}
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
                <Text style={styles.timeBadgeText}>
                  {" "}{upcomingAppointment.scheduledDate} · {upcomingAppointment.scheduledTime}
                </Text>
              </View>
              <View style={styles.clinicBadge}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={colors.textSecondary}
                />
                <Text style={styles.clinicBadgeText}> {upcomingAppointment.clinicName}</Text>
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
                  ToastService.info(
                    `${upcomingAppointment.clinicName}, ${upcomingAppointment.clinicAddress}`,
                    "Clinic Directions"
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
        )}

        {/* Section: Account & Identity */}
        <Text style={styles.sectionTitle}>Account & Identity</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(NavigationStrings.EDIT_PROFILE)}
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
          >
            <View style={styles.menuRowLeft}>
              <View
                style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}
              >
                <Ionicons
                  name="person-outline"
                  size={moderateScale(18)}
                  color={colors.primaryBlue}
                />
              </View>
              <View style={styles.menuTitleCol}>
                <Text style={styles.menuRowTitle} numberOfLines={1}>
                  Edit Profile
                </Text>
                <Text style={styles.menuRowSubtitle} numberOfLines={1}>
                  Name, Mobile & Aadhaar Card
                </Text>
              </View>
            </View>
            <View style={styles.menuRowRight}>
              <StatusBadge
                label={profile.isAadhaarVerified ? "Verified" : "Pending"}
                variant={profile.isAadhaarVerified ? "success" : "warning"}
                icon="shield-checkmark"
              />
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: Medical Records & Healthcare */}
        <Text style={styles.sectionTitle}>Dental Health & Records</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              ToastService.info(
                "3 authorized prescriptions and dental notes on file.",
                "Dental Records"
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
              <View style={styles.menuTitleCol}>
                <Text style={styles.menuRowTitle} numberOfLines={1}>
                  Dental History & Prescriptions
                </Text>
                <Text style={styles.menuRowSubtitle} numberOfLines={1}>
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
              ToastService.info(
                "Full-mouth panoramic OPG scan verified.",
                "X-Ray Scans"
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
              <View style={styles.menuTitleCol}>
                <Text style={styles.menuRowTitle} numberOfLines={1}>
                  Digital X-Rays & Scans
                </Text>
                <Text style={styles.menuRowSubtitle} numberOfLines={1}>
                  2 Intraoral scans uploaded
                </Text>
              </View>
            </View>
            <View style={styles.menuRowRight}>
              <StatusBadge
                label="2 Scans"
                variant="success"
                showIcon={false}
              />
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              ToastService.info(
                `Policy #${profile.insurancePolicyNumber || "SG-99420"} active under ${profile.insuranceProvider || "SmileGuard Health"} (${profile.insuranceCoveragePercent || 80}% coverage).`,
                "Dental Insurance"
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
              <View style={styles.menuTitleCol}>
                <Text style={styles.menuRowTitle} numberOfLines={1}>
                  Dental Insurance Card
                </Text>
                <Text style={styles.menuRowSubtitle} numberOfLines={1}>
                  {profile.insuranceProvider || "SmileGuard"} · {profile.insuranceCoveragePercent || 80}% coverage
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
              <View style={styles.menuTitleCol}>
                <Text style={styles.menuRowTitle} numberOfLines={1}>
                  Appointment Reminders
                </Text>
                <Text style={styles.menuRowSubtitle} numberOfLines={1}>
                  Receive SMS & Push alerts
                </Text>
              </View>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={handleToggleReminders}
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
              <View style={styles.menuTitleCol}>
                <Text
                  style={[styles.menuRowTitle, { color: "#EF4444" }]}
                  numberOfLines={1}
                >
                  24/7 Dental Emergency Helpline
                </Text>
                <Text style={styles.menuRowSubtitle} numberOfLines={1}>
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
              ToastService.info(
                "Need help? Email us at support@dentacare.com",
                "DentaCare Support"
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
              <View style={styles.menuTitleCol}>
                <Text style={styles.menuRowTitle} numberOfLines={1}>
                  Help Center & FAQ
                </Text>
                <Text style={styles.menuRowSubtitle} numberOfLines={1}>
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
                ToastService.info(
                  "Dialing 1800-DENTACARE (toll-free)",
                  "Calling Emergency..."
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
              appointments and dental records.
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                style={styles.modalCancelHalfBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogoutConfirm}
                disabled={isLoggingOut}
                style={styles.modalLogoutHalfBtn}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalLogoutText}>Log Out</Text>
                )}
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
    fontSize: textScale(12.5),
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10),
    color: colors.textSecondary,
    marginTop: 2,
  },
  appointmentSpotlightCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(18),
  },
  spotlightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(10),
  },
  spotlightTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
  },
  activeDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#10B981",
  },
  spotlightTagText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(10),
    color: "#10B981",
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
    marginBottom: moderateScaleVertical(12),
  },
  spotlightDoctorImg: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(12),
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
    fontFamily: fontFamily.regular,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
    marginTop: 1,
  },
  spotlightService: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.primaryBlue,
    marginTop: 3,
  },
  spotlightTimeLocationRow: {
    flexDirection: "row",
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(12),
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(8),
  },
  timeBadgeText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: colors.primaryBlue,
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
  },
  spotlightViewBtn: {
    flex: 1,
    backgroundColor: colors.primaryBlue,
    paddingVertical: moderateScaleVertical(10),
    borderRadius: moderateScale(12),
    alignItems: "center",
  },
  spotlightViewText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.white,
  },
  spotlightDirectionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(4),
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(10),
    borderRadius: moderateScale(12),
  },
  spotlightDirectionsText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(10),
    marginTop: moderateScaleVertical(6),
  },
  cardGroup: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: moderateScaleVertical(16),
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconBox: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
  },
  menuTitleCol: {
    flex: 1,
  },
  menuRowTitle: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(13.5),
    color: colors.textPrimary,
  },
  menuRowSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
    marginTop: 2,
  },
  menuRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(6),
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: moderateScale(14),
    paddingVertical: moderateScaleVertical(14),
    marginTop: moderateScaleVertical(8),
    marginBottom: moderateScaleVertical(14),
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
    marginBottom: moderateScaleVertical(10),
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
    backgroundColor: colors.white,
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    alignItems: "center",
  },
  modalIconCircle: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScaleVertical(14),
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
    marginVertical: moderateScaleVertical(12),
  },
  emergencyCallBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
    width: "100%",
    backgroundColor: "#EF4444",
    borderRadius: moderateScale(14),
    paddingVertical: moderateScaleVertical(13),
    marginTop: moderateScaleVertical(6),
  },
  emergencyCallText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.white,
  },
  modalCancelBtn: {
    width: "100%",
    paddingVertical: moderateScaleVertical(12),
    alignItems: "center",
    marginTop: moderateScaleVertical(6),
  },
  modalButtonGroup: {
    flexDirection: "row",
    gap: moderateScale(10),
    width: "100%",
    marginTop: moderateScaleVertical(8),
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
  modalCancelText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  modalLogoutText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.white,
  },
});

export default Profile;
