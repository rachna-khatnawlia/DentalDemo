import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import imagepath from "../../constants/imagepath";
import NavigationStrings from "../../navigation/NavigationStrings";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";
import notificationService from "../../services/notificationService";
import socketService from "../../services/socketService";
import { NotificationItem } from "../../types/models";
import ToastService from "../../services/toastService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface NotificationScreenProps {
  navigation: any;
}

type NotificationCategory =
  | "all"
  | "appointments"
  | "reminders"
  | "reports"
  | "offers";

const NotificationScreen: React.FC<NotificationScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (cat: NotificationCategory) => {
    try {
      const items = await notificationService.getNotifications(
        cat === "all" ? undefined : cat
      );
      setNotifications(items);
    } catch (e) {
      console.warn("[NotificationScreen] Error fetching notifications", e);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchNotifications(activeTab).finally(() => setIsLoading(false));
  }, [activeTab, fetchNotifications]);

  // Subscribe to real-time notifications via Socket.IO
  useEffect(() => {
    const handleNewNotification = (newNotif: NotificationItem) => {
      setNotifications((prev) => [newNotif, ...prev]);
    };

    socketService.on("notification:new", handleNewNotification);

    return () => {
      socketService.off("notification:new", handleNewNotification);
    };
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications(activeTab);
    setIsRefreshing(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    ToastService.success("All notifications marked as read.", "Notifications");
    try {
      await notificationService.markAllAsRead();
    } catch (e) {
      console.warn("[NotificationScreen] Failed to mark all as read", e);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            const ids = notifications.map((n) => n.id);
            setNotifications([]);
            ToastService.info("All notifications cleared.", "Cleared");
            for (const id of ids) {
              await notificationService.deleteNotification(id);
            }
          },
        },
      ]
    );
  };

  const handleItemPress = async (item: NotificationItem) => {
    // Optimistically mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    try {
      await notificationService.markAsRead(item.id);
    } catch (e) {
      console.warn("[NotificationScreen] Failed to mark as read", e);
    }

    // Navigate to action screen
    if (item.actionScreen) {
      if (item.actionScreen === NavigationStrings.DOCTOR_DETAIL || item.actionScreen === "DoctorDetail") {
        navigation.navigate(NavigationStrings.DOCTOR_DETAIL, {
          doctor: {
            id: "doc_01",
            name: "Dr. Rohan Mehta",
            degree: "BDS, MDS - Orthodontist",
            rating: "4.8",
            reviewsCount: "320",
            location: "SmileCare Dental Clinic, New Delhi",
            image: imagepath.dentistRohan,
          },
        });
      } else if (item.actionScreen === NavigationStrings.BOOK_APPOINTMENT || item.actionScreen === "BookAppointment") {
        navigation.navigate(NavigationStrings.BOOK_APPOINTMENT, {
          doctor: {
            id: "doc_01",
            name: "Dr. Rohan Mehta",
            degree: "BDS, MDS - Orthodontist",
            image: imagepath.dentistRohan,
          },
        });
      } else {
        navigation.navigate(item.actionScreen);
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationService.deleteNotification(id);
    } catch (e) {
      console.warn("[NotificationScreen] Failed to delete notification", e);
    }
  };

  const getIconConfig = (iconType: NotificationItem["iconType"]) => {
    switch (iconType) {
      case "calendar":
        return {
          icon: "calendar-outline" as const,
          color: colors.primaryBlue,
          bgColor: "#EBF5FF",
        };
      case "checkup":
        return {
          icon: "time-outline" as const,
          color: "#F59E0B",
          bgColor: "#FEF3C7",
        };
      case "scan":
        return {
          icon: "document-text-outline" as const,
          color: "#10B981",
          bgColor: "#ECFDF5",
        };
      case "tip":
      default:
        return {
          icon: "bulb-outline" as const,
          color: "#06B6D4",
          bgColor: "#E0F2FE",
        };
    }
  };

  // Group notifications by dateGroup
  const groups: { [key: string]: NotificationItem[] } = {};
  notifications.forEach((item) => {
    const grp = item.dateGroup || "Today";
    if (!groups[grp]) {
      groups[grp] = [];
    }
    groups[grp].push(item);
  });

  const filterTabs: { key: NotificationCategory; label: string }[] = [
    { key: "all", label: `All (${notifications.length})` },
    { key: "appointments", label: "Appointments" },
    { key: "reminders", label: "Reminders" },
    { key: "reports", label: "Reports & Scans" },
    { key: "offers", label: "Offers & Tips" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + moderateScaleVertical(8) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons
            name="chevron-back"
            size={moderateScale(24)}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} New</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRightActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleMarkAllRead}
              style={styles.markReadBtn}
            >
              <Ionicons
                name="checkmark-done"
                size={moderateScale(18)}
                color={colors.primaryBlue}
              />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClearAll}
              style={styles.clearBtn}
            >
              <Ionicons
                name="trash-outline"
                size={moderateScale(18)}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs (Horizontal Scroll) */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.tabsScrollContent}
        >
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabPill,
                activeTab === tab.key && styles.tabPillActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
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
          {
            paddingBottom:
              Math.max(insets.bottom, moderateScaleVertical(20)) +
              moderateScaleVertical(20),
          },
        ]}
      >
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primaryBlue} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="notifications-off-outline"
                size={moderateScale(42)}
                color={colors.primaryBlue}
              />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You are all caught up! You will receive updates about upcoming
              appointments, treatments, and dental tips here.
            </Text>
          </View>
        ) : (
          Object.keys(groups).map((groupName) => (
            <View key={groupName} style={styles.groupContainer}>
              <Text style={styles.groupHeaderTitle}>{groupName}</Text>

              {groups[groupName].map((item) => {
                const config = getIconConfig(item.iconType);
                return (
                  <View key={item.id} style={styles.cardOuterWrapper}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      bounces={false}
                      directionalLockEnabled={true}
                      contentContainerStyle={styles.cardSwipeContent}
                    >
                      <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => handleItemPress(item)}
                        style={[
                          styles.card,
                          !item.isRead && styles.cardUnread,
                        ]}
                      >
                        {/* Unread Glow Indicator */}
                        {!item.isRead && <View style={styles.unreadDot} />}

                        <View style={styles.cardHeaderRow}>
                          <View
                            style={[
                              styles.iconBox,
                              { backgroundColor: config.bgColor },
                            ]}
                          >
                            <Ionicons
                              name={config.icon}
                              size={moderateScale(20)}
                              color={config.color}
                            />
                          </View>

                          <View style={styles.cardBody}>
                            <View style={styles.titleRow}>
                              <Text
                                style={[
                                  styles.cardTitle,
                                  !item.isRead && styles.cardTitleUnread,
                                ]}
                              >
                                {item.title}
                              </Text>
                              <TouchableOpacity
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                onPress={() => handleDeleteItem(item.id)}
                                style={styles.closeBtn}
                              >
                                <Ionicons
                                  name="close"
                                  size={moderateScale(16)}
                                  color={colors.textMuted}
                                />
                              </TouchableOpacity>
                            </View>

                            <Text style={styles.cardMessage}>{item.message}</Text>

                            <View style={styles.footerRow}>
                              <Text style={styles.timeText}>
                                <Ionicons
                                  name="time-outline"
                                  size={moderateScale(11)}
                                  color={colors.textMuted}
                                />{" "}
                                {item.time}
                              </Text>

                              {item.actionLabel && (
                                <View style={styles.actionPill}>
                                  <Text style={styles.actionPillText}>
                                    {item.actionLabel}
                                  </Text>
                                  <Ionicons
                                    name="arrow-forward"
                                    size={moderateScale(12)}
                                    color={colors.primaryBlue}
                                  />
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Swipe-to-delete Action */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleDeleteItem(item.id)}
                        style={styles.swipeDeleteAction}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={moderateScale(20)}
                          color={colors.white}
                        />
                        <Text style={styles.swipeDeleteText}>Delete</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScaleVertical(12),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    color: colors.textPrimary,
  },
  unreadBadge: {
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(3),
    borderRadius: moderateScale(12),
  },
  unreadBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11),
    color: colors.primaryBlue,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
  },
  markReadBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: colors.primaryBlueLight,
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsWrapper: {
    backgroundColor: colors.white,
    paddingVertical: moderateScaleVertical(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tabsScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(16),
  },
  tabPill: {
    marginRight: moderateScale(8),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(8),
    borderRadius: moderateScale(20),
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabPillActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  tabText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(12),
  },
  loadingBox: {
    paddingVertical: moderateScaleVertical(40),
    alignItems: "center",
    gap: moderateScale(8),
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12.5),
    color: colors.textMuted,
  },
  groupContainer: {
    marginBottom: moderateScaleVertical(16),
  },
  groupHeaderTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13),
    color: colors.textSecondary,
    marginBottom: moderateScaleVertical(8),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardOuterWrapper: {
    marginBottom: moderateScaleVertical(10),
    borderRadius: moderateScale(16),
  },
  cardSwipeContent: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  card: {
    width: SCREEN_WIDTH - moderateScale(32),
    backgroundColor: colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  swipeDeleteAction: {
    width: moderateScale(76),
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: moderateScale(16),
    marginLeft: moderateScale(8),
  },
  swipeDeleteText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(11),
    color: colors.white,
    marginTop: moderateScaleVertical(4),
  },
  cardUnread: {
    backgroundColor: "#FDFEFE",
    borderColor: "#BFDBFE",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.08,
  },
  unreadDot: {
    position: "absolute",
    top: moderateScaleVertical(14),
    right: moderateScale(14),
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: colors.primaryBlue,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconBox: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(14),
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
  },
  cardBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: moderateScale(14),
  },
  cardTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(14),
    color: colors.textPrimary,
    flex: 1,
    lineHeight: textScale(18),
  },
  cardTitleUnread: {
    fontFamily: fontFamily.bold,
    color: "#0F172A",
  },
  closeBtn: {
    paddingLeft: moderateScale(8),
  },
  cardMessage: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12.5),
    color: colors.textSecondary,
    lineHeight: textScale(18),
    marginTop: moderateScaleVertical(4),
    marginBottom: moderateScaleVertical(8),
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: moderateScaleVertical(2),
  },
  timeText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: colors.textMuted,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(12),
  },
  actionPillText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(11.5),
    color: colors.primaryBlue,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateScaleVertical(60),
    paddingHorizontal: moderateScale(30),
  },
  emptyIconCircle: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: colors.primaryBlueLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScaleVertical(16),
  },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(8),
  },
  emptySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: textScale(20),
  },
});

export default NotificationScreen;
