import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";
import ToastService from "../../services/toastService";

interface HelpCenterProps {
  navigation: any;
  route?: any;
}

type FaqCategory = "all" | "appointments" | "emergency" | "billing" | "records";

interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "faq_1",
    category: "appointments",
    question: "How do I book or reschedule an appointment?",
    answer:
      "You can browse dental specialists from the Home tab, choose your preferred doctor or dental service, select an available date and time slot, and confirm instantly. To reschedule, select your upcoming appointment and choose a new slot.",
  },
  {
    id: "faq_2",
    category: "emergency",
    question: "What should I do during a dental emergency?",
    answer:
      "If you suffer from sudden severe toothache, a chipped tooth, bleeding, or trauma, contact our 24/7 Dental Emergency Hotline immediately at +1 (800) 555-0199. In case of a knocked-out tooth, preserve it in cold milk or saliva and reach the clinic within 60 minutes.",
  },
  {
    id: "faq_3",
    category: "billing",
    question: "What payment methods are accepted at clinics?",
    answer:
      "We accept all major Credit/Debit cards, UPI, Apple Pay, Net Banking, and cash at all partnered dental clinics. Itemized digital invoices and receipts are generated automatically upon completion of your visit.",
  },
  {
    id: "faq_4",
    category: "records",
    question: "How can I access my digital X-rays and prescriptions?",
    answer:
      "All your historical treatment records, verified intraoral OPG scans, and digital prescriptions are securely stored under your Profile > 'Dental Health & Records' section.",
  },
  {
    id: "faq_5",
    category: "appointments",
    question: "Can I do a walk-in visit without booking?",
    answer:
      "Yes, walk-in patients are warmly welcome for priority assessment and emergencies. However, scheduling in advance via the app is advised to guarantee your preferred time slot and avoid waiting.",
  },
];

const HelpCenter: React.FC<HelpCenterProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>(
    route?.params?.initialCategory || "all"
  );
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq_1");

  // Contact Form state
  const [inquiryCategory, setInquiryCategory] = useState<string>("Appointment");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phone Call Handler
  const handleCall = (phoneNumber: string, label: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      ToastService.info(
        `Helpline: ${phoneNumber}`,
        `${label} Number`
      );
    });
  };

  // Email Handler
  const handleEmail = (emailAddress: string) => {
    Linking.openURL(
      `mailto:${emailAddress}?subject=DentaCare%20Support%20Request`
    ).catch(() => {
      ToastService.info(
        `Support Email: ${emailAddress}`,
        "Email Support"
      );
    });
  };

  // WhatsApp / SMS Handler
  const handleChat = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    Linking.openURL(
      `https://wa.me/${cleanNumber}?text=Hi%20DentaCare%2C%20I%20need%20assistance%20with%20my%20dental%20care.`
    ).catch(() => {
      ToastService.info(
        `Chat Assistant: ${phoneNumber}`,
        "Direct Messaging"
      );
    });
  };

  // Toggle FAQ expansion
  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      return (
        selectedCategory === "all" || item.category === selectedCategory
      );
    });
  }, [selectedCategory]);

  // Submit Inquiry Form
  const handleSubmitInquiry = () => {
    if (!inquiryMessage.trim()) {
      ToastService.warning(
        "Please enter your message before sending.",
        "Missing Message"
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setInquirySubject("");
      setInquiryMessage("");
      ToastService.success(
        "Inquiry received! Our dental care team will respond within 2 hours.",
        "Message Sent"
      );
    }, 800);
  };

  const categories: { key: FaqCategory; label: string }[] = [
    { key: "all", label: "All Questions" },
    { key: "appointments", label: "Appointments" },
    { key: "emergency", label: "Emergency" },
    { key: "billing", label: "Billing" },
    { key: "records", label: "Records" },
  ];

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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Help Center
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            24/7 Care & Support
          </Text>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.onlineDot} />
          <Text style={styles.statusPillText}>Online</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateScaleVertical(40) },
        ]}
      >
        {/* Hero Greeting */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.heroTitle} numberOfLines={1}>
                How can we help you?
              </Text>
              <Text style={styles.heroSubtitle}>
                Instant helpline numbers, email support, and answers to common dental questions.
              </Text>
            </View>
            <View style={styles.heroIconBadge}>
              <MaterialCommunityIcons
                name="face-agent"
                size={moderateScale(28)}
                color={colors.primaryBlue}
              />
            </View>
          </View>
        </View>

        {/* Section: Direct Contact Channels */}
        <Text style={styles.sectionHeading}>Contact Channels</Text>
        <Text style={styles.sectionSubheading}>
          Reach out to our customer care team or emergency helpline directly
        </Text>

        <View style={styles.contactCardsList}>
          {/* Card 1: 24/7 Dental Emergency Helpline */}
          <View style={[styles.contactCard, styles.emergencyCardBorder]}>
            <View style={styles.contactCardHeader}>
              <View
                style={[
                  styles.contactIconBox,
                  { backgroundColor: "#FEE2E2" },
                ]}
              >
                <Ionicons
                  name="medical"
                  size={moderateScale(20)}
                  color="#DC2626"
                />
              </View>
              <View style={styles.contactDetailsCol}>
                <View style={styles.tagRow}>
                  <Text
                    style={styles.contactCardTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Emergency Helpline
                  </Text>
                  <View style={styles.emergencyTag}>
                    <Text style={styles.emergencyTagText}>24/7 PRIORITY</Text>
                  </View>
                </View>
                <Text style={styles.contactPhone} numberOfLines={1}>
                  +1 (800) 555-0199
                </Text>
                <Text style={styles.contactSubtext}>
                  Severe acute tooth pain, trauma, swelling or bleeding
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleCall("+1 (800) 555-0199", "Emergency")}
              style={styles.emergencyActionBtn}
            >
              <Ionicons name="call" size={16} color={colors.white} />
              <Text style={styles.emergencyActionBtnText} numberOfLines={1}>
                Call Emergency Now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Toll-Free Customer Care */}
          <View style={styles.contactCard}>
            <View style={styles.contactCardHeader}>
              <View
                style={[
                  styles.contactIconBox,
                  { backgroundColor: colors.primaryBlueLight },
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={moderateScale(20)}
                  color={colors.primaryBlue}
                />
              </View>
              <View style={styles.contactDetailsCol}>
                <View style={styles.tagRow}>
                  <Text
                    style={styles.contactCardTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Customer Care
                  </Text>
                  <View style={styles.tollFreeTag}>
                    <Text style={styles.tollFreeTagText}>TOLL FREE</Text>
                  </View>
                </View>
                <Text style={styles.contactPhone} numberOfLines={1}>
                  1800-200-3368
                </Text>
                <Text style={styles.contactSubtext}>
                  General consultations & booking inquiries · Mon - Sun (8 AM - 9 PM)
                </Text>
              </View>
            </View>
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCall("1800-200-3368", "Customer Care")}
                style={styles.primaryActionBtn}
              >
                <Ionicons name="call" size={15} color={colors.white} />
                <Text style={styles.primaryActionBtnText} numberOfLines={1}>
                  Call 1800-200-3368
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card 3: Support Email */}
          <View style={styles.contactCard}>
            <View style={styles.contactCardHeader}>
              <View
                style={[
                  styles.contactIconBox,
                  { backgroundColor: "#ECFDF5" },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={moderateScale(20)}
                  color="#10B981"
                />
              </View>
              <View style={styles.contactDetailsCol}>
                <View style={styles.tagRow}>
                  <Text
                    style={styles.contactCardTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Email Support
                  </Text>
                  <View style={styles.emailTag}>
                    <Text style={styles.emailTagText}>&lt; 2 HR REPLY</Text>
                  </View>
                </View>
                <Text style={styles.contactPhone} numberOfLines={1}>
                  support@dentacare.com
                </Text>
                <Text style={styles.contactSubtext}>
                  Invoices, doctor prescriptions, feedback & portal support
                </Text>
              </View>
            </View>
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleEmail("support@dentacare.com")}
                style={styles.outlineActionBtn}
              >
                <Ionicons
                  name="mail"
                  size={15}
                  color={colors.primaryBlue}
                />
                <Text style={styles.outlineActionBtnText} numberOfLines={1}>
                  Send an Email
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card 4: WhatsApp Support */}
          <View style={styles.contactCard}>
            <View style={styles.contactCardHeader}>
              <View
                style={[
                  styles.contactIconBox,
                  { backgroundColor: "#F0FDF4" },
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={moderateScale(20)}
                  color="#16A34A"
                />
              </View>
              <View style={styles.contactDetailsCol}>
                <View style={styles.tagRow}>
                  <Text
                    style={styles.contactCardTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Chat Assistant
                  </Text>
                  <View style={styles.whatsappTag}>
                    <Text style={styles.whatsappTagText}>WHATSAPP</Text>
                  </View>
                </View>
                <Text style={styles.contactPhone} numberOfLines={1}>
                  +1 (555) 019-2834
                </Text>
                <Text style={styles.contactSubtext}>
                  Fast appointment confirmations, directions & quick updates
                </Text>
              </View>
            </View>
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleChat("+1 (555) 019-2834")}
                style={[styles.outlineActionBtn, { borderColor: "#16A34A" }]}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={15}
                  color="#16A34A"
                />
                <Text
                  style={[styles.outlineActionBtnText, { color: "#16A34A" }]}
                  numberOfLines={1}
                >
                  Open WhatsApp Chat
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section: Frequently Asked Questions */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>
            <Text style={styles.sectionSubheading}>
              Find immediate answers to top dental queries
            </Text>
          </View>
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat.key)}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FAQ Accordion List */}
        <View style={styles.faqList}>
          {filteredFaqs.length === 0 ? (
            <View style={styles.emptyFaqState}>
              <Ionicons
                name="help-circle-outline"
                size={moderateScale(32)}
                color={colors.textMuted}
              />
              <Text style={styles.emptyFaqTitle}>No questions found</Text>
              <Text style={styles.emptyFaqSubtitle}>
                Please select another category or contact our live care desk above.
              </Text>
            </View>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <View key={faq.id} style={styles.faqCard}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleFaq(faq.id)}
                    style={styles.faqHeader}
                  >
                    <View style={styles.faqQuestionRow}>
                      <View style={styles.faqQuestionDot} />
                      <Text style={styles.faqQuestionText}>
                        {faq.question}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Section: Send an Inquiry Form */}
        <View style={styles.inquiryCard}>
          <View style={styles.inquiryHeader}>
            <View
              style={[
                styles.contactIconBox,
                { backgroundColor: "#EFF6FF" },
              ]}
            >
              <Feather
                name="message-square"
                size={moderateScale(18)}
                color={colors.primaryBlue}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inquiryTitle}>Still have a question?</Text>
              <Text style={styles.inquirySubtitle}>
                Leave a direct message and our dental desk will assist you.
              </Text>
            </View>
          </View>

          {/* Category Chips */}
          <Text style={styles.inputLabel}>Inquiry Topic</Text>
          <View style={styles.inquiryChipsRow}>
            {["Appointment", "Doctor Query", "Billing", "Other"].map((topic) => {
              const isSelected = inquiryCategory === topic;
              return (
                <TouchableOpacity
                  key={topic}
                  activeOpacity={0.7}
                  onPress={() => setInquiryCategory(topic)}
                  style={[
                    styles.inquiryChip,
                    isSelected && styles.inquiryChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.inquiryChipText,
                      isSelected && styles.inquiryChipTextSelected,
                    ]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Subject Field */}
          <Text style={styles.inputLabel}>Subject (Optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Question regarding scaling consultation"
            placeholderTextColor={colors.textMuted}
            value={inquirySubject}
            onChangeText={setInquirySubject}
          />

          {/* Message Field */}
          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            placeholder="Type your question or request here..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={inquiryMessage}
            onChangeText={setInquiryMessage}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmitInquiry}
            disabled={isSubmitting}
            style={styles.submitInquiryBtn}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="paper-plane" size={16} color={colors.white} />
                <Text style={styles.submitInquiryBtnText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpCenter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.profileBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScaleVertical(12),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: colors.backBtnBg,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleCol: {
    flex: 1,
    minWidth: 0,
    marginLeft: moderateScale(12),
    marginRight: moderateScale(8),
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(17),
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textSecondary,
    marginTop: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(14),
    gap: moderateScale(5),
    flexShrink: 0,
  },
  onlineDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#10B981",
  },
  statusPillText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11),
    color: "#059669",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(16),
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(18),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(20),
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.cardShadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTextRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  heroTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    color: colors.textPrimary,
  },
  heroSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    marginTop: moderateScaleVertical(4),
    lineHeight: textScale(17),
  },
  heroIconBadge: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: colors.primaryBlueLight,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: moderateScale(10),
    flexShrink: 0,
  },
  sectionHeading: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
    color: colors.textPrimary,
  },
  sectionSubheading: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: moderateScaleVertical(12),
  },
  contactCardsList: {
    gap: moderateScaleVertical(12),
    marginBottom: moderateScaleVertical(22),
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  emergencyCardBorder: {
    borderColor: "#FECACA",
    backgroundColor: "#FFFBFB",
  },
  contactCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  contactIconBox: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(10),
    flexShrink: 0,
  },
  contactDetailsCol: {
    flex: 1,
    minWidth: 0,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: moderateScaleVertical(4),
    columnGap: moderateScale(6),
    marginBottom: moderateScaleVertical(3),
  },
  contactCardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13.5),
    color: colors.textPrimary,
    flexShrink: 1,
  },
  emergencyTag: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    alignSelf: "center",
    flexShrink: 0,
  },
  emergencyTagText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(8.5),
    color: "#DC2626",
    letterSpacing: 0.2,
  },
  tollFreeTag: {
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    alignSelf: "center",
    flexShrink: 0,
  },
  tollFreeTagText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(8.5),
    color: colors.primaryBlue,
    letterSpacing: 0.2,
  },
  emailTag: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    alignSelf: "center",
    flexShrink: 0,
  },
  emailTagText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(8.5),
    color: "#059669",
    letterSpacing: 0.2,
  },
  whatsappTag: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScaleVertical(2),
    borderRadius: moderateScale(6),
    alignSelf: "center",
    flexShrink: 0,
  },
  whatsappTagText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(8.5),
    color: "#16A34A",
    letterSpacing: 0.2,
  },
  contactPhone: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13.5),
    color: colors.textPrimary,
    marginTop: 2,
  },
  contactSubtext: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: textScale(16),
  },
  cardActionsRow: {
    marginTop: moderateScaleVertical(12),
    flexDirection: "row",
  },
  emergencyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: moderateScaleVertical(10),
    borderRadius: moderateScale(12),
    marginTop: moderateScaleVertical(12),
    gap: moderateScale(6),
  },
  emergencyActionBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12.5),
    color: colors.white,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryBlue,
    paddingVertical: moderateScaleVertical(9),
    borderRadius: moderateScale(10),
    gap: moderateScale(6),
  },
  primaryActionBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12.5),
    color: colors.white,
  },
  outlineActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
    paddingVertical: moderateScaleVertical(9),
    borderRadius: moderateScale(10),
    gap: moderateScale(6),
  },
  outlineActionBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.primaryBlue,
  },
  sectionHeaderRow: {
    marginTop: moderateScaleVertical(6),
  },
  filterPillsRow: {
    flexDirection: "row",
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(14),
  },
  filterPill: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(7),
    borderRadius: moderateScale(20),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterPillActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  filterPillText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  faqList: {
    gap: moderateScaleVertical(10),
    marginBottom: moderateScaleVertical(22),
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: moderateScale(14),
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: moderateScale(10),
    gap: moderateScale(8),
  },
  faqQuestionDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: colors.primaryBlue,
  },
  faqQuestionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.textPrimary,
    flex: 1,
    lineHeight: textScale(18),
  },
  faqAnswerContainer: {
    paddingHorizontal: moderateScale(14),
    paddingBottom: moderateScaleVertical(14),
    paddingTop: moderateScaleVertical(2),
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  faqAnswerText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12.5),
    color: colors.textSecondary,
    lineHeight: textScale(18),
  },
  emptyFaqState: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(14),
    padding: moderateScale(24),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyFaqTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.textPrimary,
    marginTop: moderateScaleVertical(8),
  },
  emptyFaqSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  inquiryCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: moderateScaleVertical(20),
  },
  inquiryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScaleVertical(14),
  },
  inquiryTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.textPrimary,
  },
  inquirySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(6),
    marginTop: moderateScaleVertical(6),
  },
  inquiryChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(8),
  },
  inquiryChip: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(6),
    borderRadius: moderateScale(8),
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inquiryChipSelected: {
    backgroundColor: colors.primaryBlueLight,
    borderColor: colors.primaryBlue,
  },
  inquiryChipText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11.5),
    color: colors.textSecondary,
  },
  inquiryChipTextSelected: {
    fontFamily: fontFamily.bold,
    color: colors.primaryBlue,
  },
  formInput: {
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
    fontFamily: fontFamily.regular,
    fontSize: textScale(12.5),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(10),
  },
  formTextArea: {
    height: moderateScaleVertical(90),
    textAlignVertical: "top",
  },
  submitInquiryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryBlue,
    paddingVertical: moderateScaleVertical(12),
    borderRadius: moderateScale(12),
    marginTop: moderateScaleVertical(6),
    gap: moderateScale(8),
  },
  submitInquiryBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.white,
  },
});
