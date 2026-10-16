import apiClient from "./apiClient";
import API_CONFIG from "../config/api.config";
import { NotificationItem, NotificationPreferences } from "../types/models";
import {
  MOCK_NOTIFICATIONS,
  MOCK_NOTIFICATION_PREFERENCES,
} from "./mockData";

export const notificationService = {
  /**
   * Fetch patient notifications with optional category filter
   */
  async getNotifications(category?: string): Promise<NotificationItem[]> {
    try {
      const response = await apiClient.get<NotificationItem[]>(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST,
        { params: { category: category === "all" ? undefined : category } }
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    if (!category || category === "all") {
      return [...MOCK_NOTIFICATIONS];
    }
    return MOCK_NOTIFICATIONS.filter((n) => n.category === category);
  },

  /**
   * Get unread notifications count for header badge
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
      );
      if (typeof response.data?.count === "number") return response.data.count;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        return 0;
      }
    }

    return MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
      );
      return response.success;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    const item = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (item) item.isRead = true;
    return true;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
      );
      return response.success;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    MOCK_NOTIFICATIONS.forEach((n) => {
      n.isRead = true;
    });
    return true;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE(id)
      );
      return response.success;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    const index = MOCK_NOTIFICATIONS.findIndex((n) => n.id === id);
    if (index !== -1) {
      MOCK_NOTIFICATIONS.splice(index, 1);
    }
    return true;
  },

  /**
   * Fetch notification reminder preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get<NotificationPreferences>(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.PREFERENCES
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    return { ...MOCK_NOTIFICATION_PREFERENCES };
  },

  /**
   * Update notification reminder preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.put<NotificationPreferences>(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.PREFERENCES,
        preferences
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    Object.assign(MOCK_NOTIFICATION_PREFERENCES, preferences);
    return { ...MOCK_NOTIFICATION_PREFERENCES };
  },
};

export default notificationService;
