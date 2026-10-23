import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
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
import { Appointment, TimeSlot } from "../../types/models";
import ToastService from "../../services/toastService";

// Generate next 7 days for reschedule selector
const generateNextDates = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
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

const RESCHEDULE_DATES = generateNextDates();

const CANCEL_REASONS = [
  "Change in personal schedule",
  "Feeling better / issue resolved",
  "Need a different hospital branch",
  "Want to reschedule for next month",
  "Other personal reason",
];

// Helper to format scheduledDate e.g. "2026-10-25" -> "Mon, 25 Oct"
export const formatCardDate = (dateString?: string) => {
  if (!dateString) return "Scheduled Date";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
};

const MyAppointments = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 640;
  const isSmallDevice = windowWidth < 360;
  const isMediumDevice = windowWidth < 400;
  const showTabIcon = isTablet;

  // Active top tab: "upcoming" | "past" | "cancelled"
  const initialTab = route?.params?.initialTab || "upcoming";
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    initialTab,
  );

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reschedule State
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(
    null,
  );
  const [selectedRescheduleDateId, setSelectedRescheduleDateId] = useState(
    RESCHEDULE_DATES[0].id,
  );
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [selectedRescheduleTime, setSelectedRescheduleTime] =
    useState("10:00 AM");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Cancel State
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState(
    CANCEL_REASONS[0],
  );
  const [isCancelling, setIsCancelling] = useState(false);

  // Load appointments from service
  const loadAppointments = useCallback(async () => {
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch (e) {
      console.warn("[MyAppointments] Failed to load appointments", e);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
    // Subscribe to real-time appointment mutations
    const unsubscribe = appointmentService.subscribe(() => {
      loadAppointments();
    });
    return () => unsubscribe();
  }, [loadAppointments]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadAppointments();
    setIsRefreshing(false);
  };

  // Filtered lists
  const upcomingList = useMemo(() => {
    return appointments.filter(
      (a) => a.status === "CONFIRMED" || a.status === "PENDING",
    );
  }, [appointments]);

  const pastCheckupsList = useMemo(() => {
    return appointments.filter((a) => a.status === "COMPLETED");
  }, [appointments]);

  const cancelledList = useMemo(() => {
    return appointments.filter((a) => a.status === "CANCELLED");
  }, [appointments]);

  // Open Reschedule Sheet
  const handleOpenReschedule = async (appointment: Appointment) => {
    setRescheduleTarget(appointment);
    setSelectedRescheduleDateId(RESCHEDULE_DATES[0].id);
    setSelectedRescheduleTime("10:00 AM");
    setRescheduleReason("");

    setIsLoadingSlots(true);
    try {
      const slots = await appointmentService.getAvailableSlots(
        appointment.doctorId,
        RESCHEDULE_DATES[0].fullDate,
      );
      setRescheduleSlots(slots);
      const availableFirst = slots.find((s) => s.available);
      if (availableFirst) {
        setSelectedRescheduleTime(availableFirst.time);
      }
    } catch (e) {
      console.warn("[MyAppointments] Failed to load reschedule slots", e);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Handle Date Change in Reschedule
  const handleSelectRescheduleDate = async (dateId: string) => {
    setSelectedRescheduleDateId(dateId);
    if (!rescheduleTarget) return;

    const matchedDate =
      RESCHEDULE_DATES.find((d) => d.id === dateId) || RESCHEDULE_DATES[0];
    setIsLoadingSlots(true);
    try {
      const slots = await appointmentService.getAvailableSlots(
        rescheduleTarget.doctorId,
        matchedDate.fullDate,
      );
      setRescheduleSlots(slots);
      const availableFirst = slots.find((s) => s.available);
      if (availableFirst) {
        setSelectedRescheduleTime(availableFirst.time);
      }
    } catch (e) {
      console.warn("[MyAppointments] Slot reload error", e);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Submit Reschedule
  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget || isRescheduling) return;

    const matchedDate =
      RESCHEDULE_DATES.find((d) => d.id === selectedRescheduleDateId) ||
      RESCHEDULE_DATES[0];

    setIsRescheduling(true);
    try {
      await appointmentService.rescheduleAppointment(
        rescheduleTarget.id,
        matchedDate.fullDate,
        selectedRescheduleTime,
        rescheduleReason.trim() || undefined,
      );

      setIsRescheduling(false);
      setRescheduleTarget(null);
      ToastService.success(
        `Appointment moved to ${matchedDate.day}, ${matchedDate.date} ${matchedDate.month} at ${selectedRescheduleTime}`,
        "Rescheduled Successfully 📅",
      );
      loadAppointments();
    } catch (e: any) {
      setIsRescheduling(false);
      ToastService.error(
        e?.message || "Could not reschedule appointment at this time.",
        "Reschedule Failed",
      );
    }
  };

  // Open Cancel Modal
  const handleOpenCancel = (appointment: Appointment) => {
    setCancelTarget(appointment);
    setSelectedCancelReason(CANCEL_REASONS[0]);
  };

  // Submit Cancel
  const handleConfirmCancel = async () => {
    if (!cancelTarget || isCancelling) return;

    setIsCancelling(true);
    try {
      await appointmentService.cancelAppointment(
        cancelTarget.id,
        selectedCancelReason,
      );

      setIsCancelling(false);
      setCancelTarget(null);
      ToastService.info(
        "Your appointment has been cancelled.",
        "Appointment Cancelled",
      );
      loadAppointments();
    } catch (e: any) {
      setIsCancelling(false);
      ToastService.error(
        e?.message || "Unable to cancel appointment.",
        "Cancellation Failed",
      );
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
        <View style={styles.headerInner}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              isSmallDevice && {
                marginRight: moderateScale(10),
                width: moderateScale(36),
                height: moderateScale(36),
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-back"
              size={isSmallDevice ? 20 : 22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text
              style={[
                styles.headerTitle,
                isSmallDevice && { fontSize: textScale(16) },
                isTablet && { fontSize: textScale(20) },
              ]}
              numberOfLines={1}
            >
              Appointments
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                isSmallDevice && { fontSize: textScale(10.5) },
              ]}
              numberOfLines={2}
            >
              Upcoming appointments & past checkup records
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(NavigationStrings.SELECT_TREATMENT)
            }
            style={[
              styles.bookNewHeaderBtn,
              isSmallDevice && styles.bookNewHeaderBtnSmall,
            ]}
          >
            <Ionicons
              name="add"
              size={moderateScale(isSmallDevice ? 14 : 16)}
              color={colors.white}
            />
            <Text
              style={[
                styles.bookNewHeaderText,
                isSmallDevice && styles.bookNewHeaderTextSmall,
              ]}
            >
              {"Book"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Tab Bar */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBarInner}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("upcoming")}
            style={[
              styles.tabBtn,
              activeTab === "upcoming" && styles.tabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "upcoming" && styles.tabBtnTextActive,
              ]}
              numberOfLines={1}
            >
              Upcoming
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === "upcoming" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "upcoming" && styles.tabBadgeTextActive,
                ]}
              >
                {upcomingList.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("past")}
            style={[styles.tabBtn, activeTab === "past" && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "past" && styles.tabBtnTextActive,
              ]}
              numberOfLines={1}
            >
              Past
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === "past" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "past" && styles.tabBadgeTextActive,
                ]}
              >
                {pastCheckupsList.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("cancelled")}
            style={[
              styles.tabBtn,
              activeTab === "cancelled" && styles.tabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "cancelled" && styles.tabBtnTextActive,
              ]}
              numberOfLines={1}
            >
              Cancelled
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === "cancelled" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "cancelled" && styles.tabBadgeTextActive,
                ]}
              >
                {cancelledList.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateScaleVertical(30) },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* ================= TAB 1: UPCOMING APPOINTMENTS ================= */}
        {activeTab === "upcoming" && (
          <View>
            {upcomingList.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconBox}>
                  <Ionicons
                    name="calendar-outline"
                    size={moderateScale(40)}
                    color={colors.primaryBlue}
                  />
                </View>
                <Text style={styles.emptyStateTitle}>
                  No Upcoming Appointments
                </Text>
                <Text style={styles.emptyStateDesc}>
                  You have no scheduled dental appointments at the moment.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() =>
                    navigation.navigate(NavigationStrings.SELECT_TREATMENT)
                  }
                  style={styles.emptyStateCTA}
                >
                  <Text style={styles.emptyStateCTAText}>
                    Book Treatment Now
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={moderateScale(15)}
                    color={colors.white}
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              upcomingList.map((apt) => (
                <View key={apt.id} style={styles.unifiedCard}>
                  {/* Card Top: Date/Time + Status */}
                  <View style={styles.cardHeaderStrip}>
                    <View style={styles.cardDateBadge}>
                      <Ionicons
                        name="calendar"
                        size={moderateScale(13)}
                        color={colors.primaryBlue}
                      />
                      <Text style={styles.cardDateBadgeText} numberOfLines={1}>
                        {formatCardDate(apt.scheduledDate)} •{" "}
                        {apt.scheduledTime}
                      </Text>
                    </View>

                    <View style={styles.statusConfirmedPill}>
                      <View style={styles.pulseDotGreen} />
                      <Text
                        style={styles.statusConfirmedText}
                        numberOfLines={1}
                      >
                        Confirmed{" "}
                        {apt.tokenNumber ? `• Token #${apt.tokenNumber}` : ""}
                      </Text>
                    </View>
                  </View>

                  {/* Doctor & Procedure Info */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate(NavigationStrings.DOCTOR_DETAIL, {
                        doctor: {
                          id: apt.doctorId,
                          name: apt.doctorName,
                          degree: apt.doctorSpecialty || "Orthodontist",
                          rating: "4.8",
                          reviewsCount: "320",
                          location: apt.clinicAddress,
                          image: apt.doctorImage || imagepath.dentistRohan,
                        },
                      })
                    }
                    style={styles.cardMainRow}
                  >
                    <Image
                      source={apt.doctorImage || imagepath.dentistRohan}
                      style={styles.cardAvatar}
                      resizeMode="cover"
                    />
                    <View style={styles.cardMainInfoCol}>
                      <Text style={styles.cardProcedureTitle} numberOfLines={2}>
                        {apt.serviceName}
                      </Text>
                      <Text style={styles.cardDoctorName} numberOfLines={1}>
                        {apt.doctorName} • {apt.doctorSpecialty || "Specialist"}
                      </Text>
                      <View style={styles.cardLocationRow}>
                        <Ionicons
                          name="location-outline"
                          size={moderateScale(12)}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.cardLocationText} numberOfLines={1}>
                          {apt.clinicAddress}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Patient & Price Sub-bar */}
                  <View style={styles.cardMetaSubBar}>
                    <View
                      style={[
                        styles.cardPatientPill,
                        apt.bookingFor === "OTHER"
                          ? styles.cardPatientPillOther
                          : styles.cardPatientPillSelf,
                      ]}
                    >
                      <Ionicons
                        name={apt.bookingFor === "OTHER" ? "people" : "person"}
                        size={moderateScale(11)}
                        color={
                          apt.bookingFor === "OTHER"
                            ? "#B45309"
                            : colors.primaryBlue
                        }
                      />
                      <Text
                        style={[
                          styles.cardPatientPillText,
                          apt.bookingFor === "OTHER"
                            ? styles.cardPatientPillTextOther
                            : styles.cardPatientPillTextSelf,
                        ]}
                        numberOfLines={1}
                      >
                        {apt.bookingFor === "OTHER"
                          ? `For: ${apt.patientName || "Other"} (${apt.patientRelation || "Other"}${
                              apt.patientAge ? ` • ${apt.patientAge}y` : ""
                            })`
                          : `For: Myself (${apt.patientName || "Patient User"})`}
                      </Text>
                    </View>

                    {apt.servicePrice && (
                      <View style={styles.cardFeePill}>
                        <Text style={styles.cardFeePillText}>
                          {apt.servicePrice}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Notes if present */}
                  {apt.notes ? (
                    <View style={styles.cardNotesStrip}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={moderateScale(12)}
                        color={colors.textMuted}
                      />
                      <Text style={styles.cardNotesText} numberOfLines={2}>
                        "{apt.notes}"
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.cardSubtleDivider} />

                  {/* Action Buttons Row */}
                  <View style={styles.cardActionBtnRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOpenReschedule(apt)}
                      style={styles.rescheduleActionBtn}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={moderateScale(14)}
                        color={colors.primaryBlue}
                      />
                      <Text style={styles.rescheduleActionText}>
                        Reschedule
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOpenCancel(apt)}
                      style={styles.cancelActionBtn}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={moderateScale(14)}
                        color="#DC2626"
                      />
                      <Text style={styles.cancelActionText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        ToastService.info(
                          `${apt.clinicName}, ${apt.clinicAddress}`,
                          "Clinic Location",
                        )
                      }
                      style={styles.directionsActionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="navigate-outline"
                        size={moderateScale(15)}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ================= TAB 2: PAST CHECKUPS ================= */}
        {activeTab === "past" && (
          <View>
            <View style={styles.pastBannerStrip}>
              <Ionicons
                name="shield-checkmark"
                size={moderateScale(16)}
                color="#059669"
              />
              <Text style={styles.pastBannerStripText}>
                Official digital clinical history & diagnostic records verified
                by lead dental doctors.
              </Text>
            </View>

            {pastCheckupsList.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons
                  name="file-tray-outline"
                  size={moderateScale(40)}
                  color={colors.primaryBlue}
                />
                <Text style={styles.emptyStateTitle}>No Past Checkups</Text>
                <Text style={styles.emptyStateDesc}>
                  Your completed treatments and checkup reports will be listed
                  here.
                </Text>
              </View>
            ) : (
              pastCheckupsList.map((checkup) => (
                <View key={checkup.id} style={styles.unifiedCard}>
                  {/* Card Top: Date/Time + Status */}
                  <View style={styles.cardHeaderStrip}>
                    <View
                      style={[
                        styles.cardDateBadge,
                        { backgroundColor: "#F0FDF4" },
                      ]}
                    >
                      <Ionicons
                        name="calendar"
                        size={moderateScale(13)}
                        color="#059669"
                      />
                      <Text
                        style={[styles.cardDateBadgeText, { color: "#065F46" }]}
                        numberOfLines={1}
                      >
                        {formatCardDate(checkup.scheduledDate)} •{" "}
                        {checkup.scheduledTime}
                      </Text>
                    </View>

                    <View style={styles.statusCompletedPill}>
                      <Ionicons
                        name="checkmark-circle"
                        size={moderateScale(13)}
                        color="#059669"
                      />
                      <Text style={styles.statusCompletedText}>Completed</Text>
                    </View>
                  </View>

                  {/* Doctor & Procedure Info */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate(NavigationStrings.DOCTOR_DETAIL, {
                        doctor: {
                          id: checkup.doctorId,
                          name: checkup.doctorName,
                          degree:
                            checkup.doctorSpecialty || "Consultant Surgeon",
                          rating: "4.8",
                          reviewsCount: "320",
                          location: checkup.clinicAddress,
                          image: checkup.doctorImage || imagepath.dentistRohan,
                        },
                      })
                    }
                    style={styles.cardMainRow}
                  >
                    <Image
                      source={checkup.doctorImage || imagepath.dentistRohan}
                      style={styles.cardAvatar}
                      resizeMode="cover"
                    />
                    <View style={styles.cardMainInfoCol}>
                      <Text style={styles.cardProcedureTitle} numberOfLines={2}>
                        {checkup.serviceName}
                      </Text>
                      <Text style={styles.cardDoctorName} numberOfLines={1}>
                        {checkup.doctorName} •{" "}
                        {checkup.doctorSpecialty || "Dental Surgeon"}
                      </Text>
                      <View style={styles.cardLocationRow}>
                        <Ionicons
                          name="location-outline"
                          size={moderateScale(12)}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.cardLocationText} numberOfLines={1}>
                          {checkup.clinicAddress}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Patient & Price Sub-bar */}
                  <View style={styles.cardMetaSubBar}>
                    <View
                      style={[
                        styles.cardPatientPill,
                        checkup.bookingFor === "OTHER"
                          ? styles.cardPatientPillOther
                          : styles.cardPatientPillSelf,
                      ]}
                    >
                      <Ionicons
                        name={
                          checkup.bookingFor === "OTHER" ? "people" : "person"
                        }
                        size={moderateScale(11)}
                        color={
                          checkup.bookingFor === "OTHER"
                            ? "#B45309"
                            : colors.primaryBlue
                        }
                      />
                      <Text
                        style={[
                          styles.cardPatientPillText,
                          checkup.bookingFor === "OTHER"
                            ? styles.cardPatientPillTextOther
                            : styles.cardPatientPillTextSelf,
                        ]}
                        numberOfLines={1}
                      >
                        {checkup.bookingFor === "OTHER"
                          ? `For: ${checkup.patientName || "Other"} (${checkup.patientRelation || "Other"}${
                              checkup.patientAge
                                ? ` • ${checkup.patientAge}y`
                                : ""
                            })`
                          : `For: Myself (${checkup.patientName || "Patient User"})`}
                      </Text>
                    </View>

                    {checkup.servicePrice && (
                      <View style={styles.cardFeePill}>
                        <Text style={styles.cardFeePillText}>
                          {checkup.servicePrice}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Unified Clinical Findings Box */}
                  {(checkup.diagnosis ||
                    (checkup.prescriptions &&
                      checkup.prescriptions.length > 0) ||
                    checkup.followUpAdvice) && (
                    <View style={styles.clinicalSummaryContainer}>
                      {checkup.diagnosis && (
                        <View style={styles.clinicalEntryRow}>
                          <MaterialCommunityIcons
                            name="stethoscope"
                            size={moderateScale(14)}
                            color="#1E40AF"
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.clinicalEntryHeading}>
                              CLINICAL DIAGNOSIS
                            </Text>
                            <Text style={styles.clinicalEntryBody}>
                              {checkup.diagnosis}
                            </Text>
                          </View>
                        </View>
                      )}

                      {checkup.treatmentSummary && (
                        <View
                          style={[
                            styles.clinicalEntryRow,
                            { marginTop: moderateScaleVertical(8) },
                          ]}
                        >
                          <Ionicons
                            name="document-text-outline"
                            size={moderateScale(14)}
                            color="#0D9488"
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.clinicalEntryHeading}>
                              TREATMENT NOTES
                            </Text>
                            <Text style={styles.clinicalEntryBody}>
                              {checkup.treatmentSummary}
                            </Text>
                          </View>
                        </View>
                      )}

                      {checkup.prescriptions &&
                        checkup.prescriptions.length > 0 && (
                          <View
                            style={[
                              styles.clinicalEntryRow,
                              { marginTop: moderateScaleVertical(8) },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="pill"
                              size={moderateScale(14)}
                              color="#2563EB"
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.clinicalEntryHeading}>
                                PRESCRIBED MEDICINES
                              </Text>
                              <View style={styles.rxTagsWrap}>
                                {checkup.prescriptions.map((med, idx) => (
                                  <View key={idx} style={styles.rxTagItem}>
                                    <Text style={styles.rxTagText}>{med}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          </View>
                        )}

                      {checkup.followUpAdvice && (
                        <View
                          style={[
                            styles.clinicalEntryRow,
                            { marginTop: moderateScaleVertical(8) },
                          ]}
                        >
                          <Ionicons
                            name="information-circle-outline"
                            size={moderateScale(14)}
                            color="#D97706"
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.clinicalEntryHeading}>
                              DOCTOR'S ADVICE
                            </Text>
                            <Text style={styles.adviceBodyText}>
                              {checkup.followUpAdvice}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.cardSubtleDivider} />

                  {/* Rebook Followup Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate(NavigationStrings.SELECT_TREATMENT, {
                        selectedService: checkup.serviceName,
                      })
                    }
                    style={styles.pastFollowupBtn}
                  >
                    <Ionicons
                      name="repeat"
                      size={moderateScale(14)}
                      color={colors.white}
                    />
                    <Text style={styles.pastFollowupBtnText}>
                      Book Follow-up / Routine Review
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={moderateScale(14)}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* ================= TAB 3: CANCELLED APPOINTMENTS ================= */}
        {activeTab === "cancelled" && (
          <View>
            {cancelledList.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={moderateScale(40)}
                  color="#10B981"
                />
                <Text style={styles.emptyStateTitle}>
                  No Cancelled Appointments
                </Text>
                <Text style={styles.emptyStateDesc}>
                  You have no cancelled appointments on record.
                </Text>
              </View>
            ) : (
              cancelledList.map((apt) => (
                <View key={apt.id} style={styles.unifiedCard}>
                  {/* Card Top: Date/Time + Status */}
                  <View style={styles.cardHeaderStrip}>
                    <View
                      style={[
                        styles.cardDateBadge,
                        { backgroundColor: "#F1F5F9" },
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={moderateScale(13)}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.cardDateBadgeText,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {formatCardDate(apt.scheduledDate)} •{" "}
                        {apt.scheduledTime}
                      </Text>
                    </View>

                    <View style={styles.statusCancelledPill}>
                      <Ionicons
                        name="close-circle"
                        size={moderateScale(12)}
                        color="#DC2626"
                      />
                      <Text style={styles.statusCancelledText}>Cancelled</Text>
                    </View>
                  </View>

                  {/* Doctor & Procedure Info */}
                  <View style={styles.cardMainRow}>
                    <Image
                      source={apt.doctorImage || imagepath.dentistRohan}
                      style={[styles.cardAvatar, { opacity: 0.85 }]}
                      resizeMode="cover"
                    />
                    <View style={styles.cardMainInfoCol}>
                      <Text style={styles.cardProcedureTitle} numberOfLines={2}>
                        {apt.serviceName}
                      </Text>
                      <Text style={styles.cardDoctorName} numberOfLines={1}>
                        {apt.doctorName} • {apt.doctorSpecialty || "Specialist"}
                      </Text>
                      <View style={styles.cardLocationRow}>
                        <Ionicons
                          name="location-outline"
                          size={moderateScale(12)}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.cardLocationText} numberOfLines={1}>
                          {apt.clinicAddress}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Patient & Price Sub-bar */}
                  <View style={styles.cardMetaSubBar}>
                    <View
                      style={[
                        styles.cardPatientPill,
                        apt.bookingFor === "OTHER"
                          ? styles.cardPatientPillOther
                          : styles.cardPatientPillSelf,
                      ]}
                    >
                      <Ionicons
                        name={apt.bookingFor === "OTHER" ? "people" : "person"}
                        size={moderateScale(11)}
                        color={
                          apt.bookingFor === "OTHER"
                            ? "#B45309"
                            : colors.primaryBlue
                        }
                      />
                      <Text
                        style={[
                          styles.cardPatientPillText,
                          apt.bookingFor === "OTHER"
                            ? styles.cardPatientPillTextOther
                            : styles.cardPatientPillTextSelf,
                        ]}
                        numberOfLines={1}
                      >
                        {apt.bookingFor === "OTHER"
                          ? `For: ${apt.patientName || "Other"} (${apt.patientRelation || "Other"})`
                          : `For: Myself (${apt.patientName || "Patient User"})`}
                      </Text>
                    </View>

                    {apt.servicePrice && (
                      <View style={styles.cardFeePill}>
                        <Text style={styles.cardFeePillText}>
                          {apt.servicePrice}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Cancellation Reason Notice */}
                  <View style={styles.cancellationNoticeStrip}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={moderateScale(14)}
                      color="#DC2626"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cancellationNoticeHeading}>
                        CANCELLATION REASON
                      </Text>
                      <Text style={styles.cancellationNoticeText}>
                        {apt.notes || "Cancelled by patient or clinic"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardSubtleDivider} />

                  {/* Rebook CTA */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate(NavigationStrings.SELECT_TREATMENT, {
                        selectedService: apt.serviceName,
                      })
                    }
                    style={styles.rebookTreatmentBtn}
                  >
                    <Ionicons
                      name="refresh"
                      size={moderateScale(15)}
                      color={colors.primaryBlue}
                    />
                    <Text style={styles.rebookTreatmentBtnText}>
                      Rebook This Appointment
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={moderateScale(14)}
                      color={colors.primaryBlue}
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ================= RESCHEDULE MODAL ================= */}
      <Modal
        visible={!!rescheduleTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setRescheduleTarget(null)}
      >
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity
            style={styles.sheetDismissOverlay}
            activeOpacity={1}
            onPress={() => setRescheduleTarget(null)}
          />
          <View
            style={[
              styles.modalSheetContainer,
              {
                paddingBottom: Math.max(
                  insets.bottom,
                  moderateScaleVertical(16),
                ),
              },
            ]}
          >
            <View style={styles.sheetDragBar} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleCol}>
                <Text style={styles.sheetTitle} numberOfLines={1}>
                  Reschedule Appointment
                </Text>
                <Text style={styles.sheetSubtitle} numberOfLines={1}>
                  Pick a new date and time for {rescheduleTarget?.doctorName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRescheduleTarget(null)}
                style={styles.sheetCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Current Appointment Preview */}
              <View style={styles.rescheduleTargetPreview}>
                <Text style={styles.previewLabel}>CURRENT BOOKING</Text>
                <Text style={styles.previewDoctorText}>
                  {rescheduleTarget?.doctorName} ·{" "}
                  {rescheduleTarget?.serviceName}
                </Text>
                <Text style={styles.previewTimeText}>
                  Currently scheduled: {rescheduleTarget?.scheduledDate} at{" "}
                  {rescheduleTarget?.scheduledTime}
                </Text>
              </View>

              {/* Select New Date */}
              <Text style={styles.rescheduleSectionTitle}>Select New Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesList}
              >
                {RESCHEDULE_DATES.map((item) => {
                  const isSelected = selectedRescheduleDateId === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => handleSelectRescheduleDate(item.id)}
                      style={[
                        styles.dateCard,
                        isSmallDevice && styles.dateCardSmall,
                        isSelected
                          ? styles.dateCardActive
                          : styles.dateCardInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateDayText,
                          isSmallDevice && { fontSize: textScale(10) },
                          isSelected ? styles.textWhite : styles.textSecondary,
                        ]}
                      >
                        {item.day}
                      </Text>
                      <Text
                        style={[
                          styles.dateNumberText,
                          isSmallDevice && { fontSize: textScale(14.5) },
                          isSelected ? styles.textWhite : styles.textPrimary,
                        ]}
                      >
                        {item.date}
                      </Text>
                      <Text
                        style={[
                          styles.dateMonthText,
                          isSmallDevice && { fontSize: textScale(9) },
                          isSelected ? styles.textWhite : styles.textMuted,
                        ]}
                      >
                        {item.month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Select New Time Slot */}
              <View style={styles.timeSectionHeader}>
                <Text style={styles.rescheduleSectionTitle}>
                  Select Time Slot
                </Text>
                {isLoadingSlots && (
                  <ActivityIndicator size="small" color={colors.primaryBlue} />
                )}
              </View>

              <View style={styles.timeSlotsGrid}>
                {rescheduleSlots.map((slot, index) => {
                  const isSelected = selectedRescheduleTime === slot.time;
                  const isAvailable = slot.available;
                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      disabled={!isAvailable}
                      onPress={() => setSelectedRescheduleTime(slot.time)}
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
                          isSmallDevice && { fontSize: textScale(11) },
                          !isAvailable && styles.textDisabled,
                          isSelected && isAvailable && styles.textWhite,
                          !isSelected && isAvailable && styles.textPrimary,
                        ]}
                        numberOfLines={1}
                      >
                        {slot.time}
                      </Text>
                      {!isAvailable && (
                        <Text style={styles.bookedTag} numberOfLines={1}>
                          Booked
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Reschedule Reason (Optional) */}
              <Text style={styles.rescheduleSectionTitle}>
                Reason for Rescheduling (Optional)
              </Text>
              <TextInput
                placeholder="e.g. Schedule conflict, traveling, etc."
                placeholderTextColor={colors.textMuted}
                value={rescheduleReason}
                onChangeText={setRescheduleReason}
                style={styles.rescheduleInput}
              />

              {/* Confirm CTA */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleConfirmReschedule}
                disabled={isRescheduling}
                style={styles.confirmRescheduleBtn}
              >
                {isRescheduling ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.confirmRescheduleText}>
                    Confirm Reschedule
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= CANCEL CONFIRMATION MODAL ================= */}
      <Modal
        visible={!!cancelTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.cancelModalCard}>
            <View style={styles.cancelWarningIconBox}>
              <Ionicons
                name="alert-circle-outline"
                size={moderateScale(38)}
                color="#EF4444"
              />
            </View>
            <Text style={styles.cancelModalTitle}>Cancel Appointment?</Text>
            <Text style={styles.cancelModalSubtitle}>
              Are you sure you want to cancel your visit with{" "}
              <Text
                style={{
                  fontFamily: fontFamily.bold,
                  color: colors.textPrimary,
                }}
              >
                {cancelTarget?.doctorName}
              </Text>{" "}
              on{" "}
              <Text
                style={{
                  fontFamily: fontFamily.bold,
                  color: colors.primaryBlue,
                }}
              >
                {cancelTarget?.scheduledDate} at {cancelTarget?.scheduledTime}
              </Text>
              ?
            </Text>

            {/* Select Reason */}
            <Text style={styles.cancelReasonHeader}>SELECT REASON</Text>
            {CANCEL_REASONS.map((reason, idx) => {
              const isSelected = selectedCancelReason === reason;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCancelReason(reason)}
                  style={[
                    styles.cancelReasonItem,
                    isSelected && styles.cancelReasonItemActive,
                  ]}
                >
                  <View
                    style={[
                      styles.cancelRadio,
                      isSelected && styles.cancelRadioActive,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={11}
                        color={colors.white}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.cancelReasonText,
                      isSelected && styles.cancelReasonTextActive,
                    ]}
                    numberOfLines={2}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Buttons */}
            <View
              style={[
                styles.cancelBtnRow,
                isSmallDevice && styles.cancelBtnRowSmall,
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCancelTarget(null)}
                style={[
                  styles.cancelKeepBtn,
                  isSmallDevice && styles.cancelKeepBtnSmall,
                ]}
              >
                <Text
                  style={[
                    styles.cancelKeepText,
                    isSmallDevice && styles.cancelKeepTextSmall,
                  ]}
                  numberOfLines={1}
                >
                  {isSmallDevice ? "Keep Visit" : "Keep Appointment"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirmCancel}
                disabled={isCancelling}
                style={[
                  styles.cancelConfirmBtn,
                  isSmallDevice && styles.cancelConfirmBtnSmall,
                ]}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.cancelConfirmText,
                      isSmallDevice && styles.cancelConfirmTextSmall,
                    ]}
                    numberOfLines={1}
                  >
                    {isSmallDevice ? "Cancel Visit" : "Yes, Cancel"}
                  </Text>
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
  headerTitleCol: {
    flex: 1,
    minWidth: 0,
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
  bookNewHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: moderateScale(11),
    paddingVertical: moderateScaleVertical(7),
    borderRadius: moderateScale(18),
    gap: moderateScale(4),
    flexShrink: 0,
    marginLeft: moderateScale(8),
  },
  bookNewHeaderBtnSmall: {
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScaleVertical(5),
    marginLeft: moderateScale(6),
  },
  bookNewHeaderText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11.5),
    color: colors.white,
  },
  bookNewHeaderTextSmall: {
    fontSize: textScale(10.5),
  },

  // Tab Bar
  tabBarWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScaleVertical(10),
  },
  tabBarInner: {
    flexDirection: "row",
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#F1F5F9",
    padding: moderateScale(6),
    borderRadius: moderateScale(14),
    gap: moderateScale(4),
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(6),
    borderRadius: moderateScale(10),
    gap: moderateScale(5),
  },
  tabBtnActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: "#64748B",
  },
  tabBtnTextActive: {
    fontFamily: fontFamily.bold,
    color: colors.primaryBlue,
  },
  tabBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScaleVertical(1),
    borderRadius: moderateScale(10),
  },
  tabBadgeActive: {
    backgroundColor: "#EFF6FF",
  },
  tabBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9.5),
    color: "#64748B",
  },
  tabBadgeTextActive: {
    color: colors.primaryBlue,
  },

  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(14),
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },

  // ================= UNIFIED APPOINTMENT CARD =================
  unifiedCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(18),
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(14),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(10),
    gap: moderateScale(6),
    flexWrap: "wrap",
  },
  cardDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
    backgroundColor: "#EFF6FF",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(7),
  },
  cardDateBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11.5),
    color: colors.primaryBlue,
  },
  statusConfirmedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
    backgroundColor: "#ECFDF5",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3.5),
    borderRadius: moderateScale(6),
  },
  pulseDotGreen: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusConfirmedText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9.5),
    color: "#059669",
    letterSpacing: 0.3,
  },
  statusCompletedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    backgroundColor: "#ECFDF5",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3.5),
    borderRadius: moderateScale(6),
  },
  statusCompletedText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9.5),
    color: "#059669",
    letterSpacing: 0.3,
  },
  statusCancelledPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    backgroundColor: "#FEF2F2",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3.5),
    borderRadius: moderateScale(6),
  },
  statusCancelledText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9.5),
    color: "#DC2626",
    letterSpacing: 0.3,
  },

  // Main Doctor & Procedure Block
  cardMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: moderateScaleVertical(10),
  },
  cardAvatar: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(13),
    flexShrink: 0,
    backgroundColor: colors.bgLight,
  },
  cardMainInfoCol: {
    flex: 1,
    minWidth: 0,
    marginLeft: moderateScale(11),
  },
  cardProcedureTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.textPrimary,
    lineHeight: textScale(18),
  },
  cardDoctorName: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(3),
    marginTop: 2,
  },
  cardLocationText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10.5),
    color: colors.textMuted,
    flex: 1,
  },

  // Meta Sub Bar (Patient + Fee)
  cardMetaSubBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(8),
  },
  cardPatientPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: moderateScale(6),
    flex: 1,
    minWidth: 0,
  },
  cardPatientPillSelf: {
    backgroundColor: "#EFF6FF",
  },
  cardPatientPillOther: {
    backgroundColor: "#FEF3C7",
  },
  cardPatientPillText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(10.5),
  },
  cardPatientPillTextSelf: {
    color: colors.primaryBlue,
  },
  cardPatientPillTextOther: {
    color: "#B45309",
  },
  cardFeePill: {
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    flexShrink: 0,
  },
  cardFeePillText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11.5),
    color: colors.textPrimary,
  },

  // Optional Notes Strip
  cardNotesStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(7),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    marginBottom: moderateScaleVertical(6),
  },
  cardNotesText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10.5),
    color: colors.textSecondary,
    fontStyle: "italic",
    flex: 1,
  },
  cardSubtleDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: moderateScaleVertical(8),
  },

  // Action Buttons Row (Upcoming)
  cardActionBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  rescheduleActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(5),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: moderateScaleVertical(8.5),
    borderRadius: moderateScale(10),
  },
  rescheduleActionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.primaryBlue,
  },
  cancelActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(5),
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: moderateScaleVertical(8.5),
    borderRadius: moderateScale(10),
  },
  cancelActionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: "#DC2626",
  },
  directionsActionBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  // Past Checkup Clinical Findings Container
  pastBannerStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: moderateScale(10),
    borderRadius: moderateScale(12),
    marginBottom: moderateScaleVertical(12),
  },
  pastBannerStripText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(10.5),
    color: "#065F46",
    lineHeight: textScale(14),
  },
  clinicalSummaryContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(11),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: moderateScale(10),
    marginBottom: moderateScaleVertical(4),
  },
  clinicalEntryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: moderateScale(7),
  },
  clinicalEntryHeading: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  clinicalEntryBody: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textPrimary,
    lineHeight: textScale(15),
  },
  rxTagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(5),
    marginTop: moderateScaleVertical(2),
  },
  rxTagItem: {
    backgroundColor: "#EFF6FF",
    borderRadius: moderateScale(5),
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScaleVertical(2),
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  rxTagText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(10.5),
    color: "#1E40AF",
  },
  adviceBodyText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: "#92400E",
    lineHeight: textScale(15),
  },
  pastFollowupBtn: {
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(11),
    paddingVertical: moderateScaleVertical(9.5),
    paddingHorizontal: moderateScale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
  },
  pastFollowupBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.white,
  },

  // Cancelled Specific Styles
  cancellationNoticeStrip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: moderateScale(7),
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: moderateScale(9),
    padding: moderateScale(9),
    marginBottom: moderateScaleVertical(4),
  },
  cancellationNoticeHeading: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(8.5),
    color: "#DC2626",
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  cancellationNoticeText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: "#991B1B",
  },
  rebookTreatmentBtn: {
    backgroundColor: "#EFF6FF",
    borderRadius: moderateScale(11),
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
    paddingVertical: moderateScaleVertical(9.5),
    paddingHorizontal: moderateScale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
  },
  rebookTreatmentBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.primaryBlue,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: moderateScaleVertical(40),
    paddingHorizontal: moderateScale(20),
  },
  emptyStateIconBox: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScaleVertical(14),
  },
  emptyStateTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(17),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(6),
  },
  emptyStateDesc: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: textScale(18),
    marginBottom: moderateScaleVertical(18),
  },
  emptyStateCTA: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScaleVertical(12),
    borderRadius: moderateScale(24),
  },
  emptyStateCTAText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13.5),
    color: colors.white,
  },

  // Reschedule Bottom Sheet
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
    borderTopLeftRadius: moderateScale(26),
    borderTopRightRadius: moderateScale(26),
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(12),
    maxHeight: "88%",
    width: "100%",
    maxWidth: 580,
    alignSelf: "center",
  },
  sheetDragBar: {
    width: moderateScale(38),
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
  },
  sheetTitleCol: {
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
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  rescheduleTargetPreview: {
    backgroundColor: colors.bgLight,
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    marginBottom: moderateScaleVertical(14),
  },
  previewLabel: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(9),
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  previewDoctorText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.textPrimary,
  },
  previewTimeText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.primaryBlue,
    marginTop: 2,
  },
  rescheduleSectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(8),
  },
  datesList: {
    gap: moderateScale(8),
    paddingRight: moderateScale(20),
    paddingBottom: moderateScaleVertical(12),
  },
  dateCard: {
    width: moderateScale(58),
    paddingVertical: moderateScaleVertical(10),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  dateCardSmall: {
    width: moderateScale(50),
    paddingVertical: moderateScaleVertical(8),
  },
  dateCardActive: {
    backgroundColor: colors.primaryBlue,
    elevation: 3,
  },
  dateCardInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dateDayText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    marginBottom: 2,
  },
  dateNumberText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
  },
  dateMonthText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(10),
    marginTop: 1,
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
  timeSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(6),
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(14),
  },
  timeChip: {
    flexBasis: "30.5%",
    flexGrow: 1,
    maxWidth: "32%",
    paddingVertical: moderateScaleVertical(10),
    borderRadius: moderateScale(10),
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
    fontSize: textScale(12),
  },
  bookedTag: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(8.5),
    color: colors.textMuted,
  },
  rescheduleInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(10),
    fontFamily: fontFamily.regular,
    fontSize: textScale(12.5),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(18),
  },
  confirmRescheduleBtn: {
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(26),
    paddingVertical: moderateScaleVertical(13),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: moderateScaleVertical(12),
  },
  confirmRescheduleText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14.5),
    color: colors.white,
  },

  // Cancel Confirmation Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
  },
  cancelModalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: moderateScale(22),
    padding: moderateScale(20),
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cancelWarningIconBox: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScaleVertical(12),
  },
  cancelModalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    color: colors.textPrimary,
    textAlign: "center",
  },
  cancelModalSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: textScale(17),
    marginTop: moderateScaleVertical(6),
    marginBottom: moderateScaleVertical(14),
  },
  cancelReasonHeader: {
    alignSelf: "flex-start",
    fontFamily: fontFamily.bold,
    fontSize: textScale(9.5),
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: moderateScaleVertical(6),
  },
  cancelReasonItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: moderateScaleVertical(8),
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: moderateScaleVertical(6),
    gap: moderateScale(8),
  },
  cancelReasonItemActive: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  cancelRadio: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cancelRadioActive: {
    borderColor: "#EF4444",
    backgroundColor: "#EF4444",
  },
  cancelReasonText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: textScale(11.5),
    color: colors.textPrimary,
  },
  cancelReasonTextActive: {
    fontFamily: fontFamily.bold,
    color: "#B91C1C",
  },
  cancelBtnRow: {
    flexDirection: "row",
    gap: moderateScale(10),
    marginTop: moderateScaleVertical(14),
    width: "100%",
  },
  cancelBtnRowSmall: {
    flexDirection: "column-reverse",
    gap: moderateScale(8),
  },
  cancelKeepBtn: {
    flex: 1,
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: moderateScaleVertical(12),
    borderRadius: moderateScale(22),
    alignItems: "center",
    justifyContent: "center",
  },
  cancelKeepBtnSmall: {
    paddingVertical: moderateScaleVertical(10),
    width: "100%",
  },
  cancelKeepText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12.5),
    color: colors.textPrimary,
  },
  cancelKeepTextSmall: {
    fontSize: textScale(12),
  },
  cancelConfirmBtn: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: moderateScaleVertical(12),
    borderRadius: moderateScale(22),
    alignItems: "center",
    justifyContent: "center",
  },
  cancelConfirmBtnSmall: {
    paddingVertical: moderateScaleVertical(10),
    width: "100%",
  },
  cancelConfirmText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12.5),
    color: colors.white,
  },
  cancelConfirmTextSmall: {
    fontSize: textScale(12),
  },

  // Patient Card Identity Badges
  aptPatientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(5),
    paddingHorizontal: moderateScale(9),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(8),
    alignSelf: "flex-start",
    marginBottom: moderateScaleVertical(10),
    maxWidth: "100%",
  },
  aptPatientRowSelf: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  aptPatientRowOther: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  aptPatientText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    flexShrink: 1,
  },
  aptPatientTextSelf: {
    color: colors.primaryBlue,
  },
  aptPatientTextOther: {
    color: "#B45309",
  },
});

export default MyAppointments;
