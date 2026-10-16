import { Platform } from "react-native";

/**
 * Environment-aware API Configuration for DentaCare Customer Mobile App.
 * In development, Android emulator connects to host via 10.0.2.2,
 * iOS simulator connects via localhost, and physical devices can connect via local LAN IP.
 */

// Default local backend ports (Node.js + Express backend standard; 5001 avoids macOS AirPlay receiver on 5000)
const DEFAULT_PORT = 5001;
const DEV_HOST = Platform.select({
  android: `http://10.0.2.2:${DEFAULT_PORT}`,
  ios: `http://localhost:${DEFAULT_PORT}`,
  default: `http://localhost:${DEFAULT_PORT}`,
});

export const API_CONFIG = {
  // Use EXPO_PUBLIC_API_URL if set in environment, otherwise fall back to local dev host
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || `${DEV_HOST}/api/v1`,
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || DEV_HOST,
  TIMEOUT_MS: 10000, // 10 seconds
  MAX_RETRY_ATTEMPTS: 2,
  
  // When enabled, if the local backend server is offline or unreachable,
  // the app gracefully provides structured mock data matching backend contracts.
  ENABLE_MOCK_FALLBACK: true,

  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      SEND_OTP: "/auth/send-otp",
      VERIFY_OTP: "/auth/verify-otp",
      RESEND_OTP: "/auth/resend-otp",
      REGISTER: "/auth/register",
      ME: "/auth/me",
      LOGOUT: "/auth/logout",
      REFRESH: "/auth/refresh",
    },
    PATIENTS: {
      ME: "/patients/me",
      SUMMARY: "/patients/me/summary",
      DOCUMENTS: "/patients/me/documents",
      PRESCRIPTIONS: "/patients/me/prescriptions",
    },
    DOCTORS: {
      LIST: "/doctors",
      DETAIL: (id: string) => `/doctors/${id}`,
      SERVICES: (id: string) => `/doctors/${id}/services`,
      REVIEWS: (id: string) => `/doctors/${id}/reviews`,
    },
    SERVICES: {
      LIST: "/services",
      DETAIL: (id: string) => `/services/${id}`,
    },
    APPOINTMENTS: {
      LIST: "/appointments",
      SLOTS: "/appointments/slots",
      CREATE: "/appointments",
      DETAIL: (id: string) => `/appointments/${id}`,
      CANCEL: (id: string) => `/appointments/${id}/cancel`,
      RESCHEDULE: (id: string) => `/appointments/${id}/reschedule`,
    },
    NOTIFICATIONS: {
      LIST: "/notifications",
      UNREAD_COUNT: "/notifications/unread-count",
      MARK_READ: (id: string) => `/notifications/${id}/read`,
      MARK_ALL_READ: "/notifications/mark-all-read",
      DELETE: (id: string) => `/notifications/${id}`,
      PREFERENCES: "/notification-preferences",
    },
    PAYMENTS: {
      HISTORY: "/payments/history",
      INVOICES: "/invoices",
    },
  },
};

export default API_CONFIG;
