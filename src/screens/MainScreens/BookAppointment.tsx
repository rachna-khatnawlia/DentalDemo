import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
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

const SERVICES_OPTIONS = [
  "Teeth Cleaning",
  "Braces Treatment",
  "Clear Aligners (Invisalign)",
  "Smile Correction",
  "General Dentistry Checkup",
];

const DATES_LIST = [
  { id: "1", day: "Mon", date: "6", month: "Oct" },
  { id: "2", day: "Tue", date: "7", month: "Oct" },
  { id: "3", day: "Wed", date: "8", month: "Oct" },
  { id: "4", day: "Thu", date: "9", month: "Oct" },
  { id: "5", day: "Fri", date: "10", month: "Oct" },
  { id: "6", day: "Sat", date: "11", month: "Oct" },
];

const TIME_SLOTS = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
];

const BookAppointment = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const doctor = route?.params?.doctor || {
    name: "Dr. Rohan Mehta",
    degree: "Orthodontist",
    rating: "4.8",
    reviewsCount: "320",
    image: imagepath.dentistRohan,
  };

  const initialService = route?.params?.selectedService || "Teeth Cleaning";
  const [selectedService, setSelectedService] = useState(initialService);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState("1"); // Mon 6 Oct by default
  const [selectedTime, setSelectedTime] = useState("10:00 AM"); // 10:00 AM by default
  const [notes, setNotes] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const activeDate = DATES_LIST.find((d) => d.id === selectedDateId) || DATES_LIST[0];

  const handleConfirm = () => {
    setShowSuccessModal(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + moderateScaleVertical(8) }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <Text style={styles.headerSubtitle}>Select date and time for your visit</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateScaleVertical(100) },
        ]}
      >
        {/* Doctor Summary Card */}
        <View style={styles.doctorMiniCard}>
          <Image
            source={doctor.image || imagepath.dentistRohan}
            style={styles.doctorAvatar}
            resizeMode="cover"
          />
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorDegree}>{doctor.degree}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={moderateScale(13)} color={colors.starYellow} />
              <Text style={styles.ratingText}>
                {" "}
                {doctor.rating}{" "}
                <Text style={styles.reviewCountText}>({doctor.reviewsCount} reviews)</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Select Service Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Select Service</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowServicePicker(!showServicePicker)}
            style={styles.serviceSelector}
          >
            <View style={styles.serviceSelectorLeft}>
              <MaterialCommunityIcons
                name="tooth-outline"
                size={moderateScale(20)}
                color={colors.primaryBlue}
              />
              <Text style={styles.selectedServiceText}>{selectedService}</Text>
            </View>
            <Ionicons
              name={showServicePicker ? "chevron-up" : "chevron-down"}
              size={moderateScale(18)}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {/* Collapsible Service Picker List */}
          {showServicePicker && (
            <View style={styles.serviceDropdown}>
              {SERVICES_OPTIONS.map((srv, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedService(srv);
                    setShowServicePicker(false);
                  }}
                  style={[
                    styles.serviceOptionItem,
                    selectedService === srv && styles.serviceOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.serviceOptionText,
                      selectedService === srv && styles.serviceOptionTextActive,
                    ]}
                  >
                    {srv}
                  </Text>
                  {selectedService === srv && (
                    <Ionicons name="checkmark" size={moderateScale(16)} color={colors.primaryBlue} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
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
          <Text style={styles.sectionLabel}>Select Time</Text>
          <View style={styles.timeSlotsGrid}>
            {TIME_SLOTS.map((slot, index) => {
              const isSelected = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTime(slot)}
                  style={[
                    styles.timeChip,
                    isSelected ? styles.timeChipActive : styles.timeChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      isSelected ? styles.textWhite : styles.textPrimary,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Add Notes (Optional) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Add Notes (Optional)</Text>
          <TextInput
            placeholder="Any specific concerns or requirements?"
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
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleConfirm}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
        </TouchableOpacity>
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
              Your appointment with {doctor.name} for {selectedService} is scheduled for{" "}
              <Text style={{ fontFamily: fontFamily.bold, color: colors.primaryBlue }}>
                {activeDate.day}, {activeDate.date} {activeDate.month} at {selectedTime}
              </Text>
              .
            </Text>

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
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.backBtnBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(14),
  },
  headerTitleContainer: {
    flex: 1,
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
  },
  doctorDetails: {
    flex: 1,
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
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
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
    gap: moderateScale(10),
  },
  timeChip: {
    width: "31%",
    paddingVertical: moderateScaleVertical(12),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
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
  timeChipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
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
});

export default BookAppointment;
