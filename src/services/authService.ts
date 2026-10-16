import apiClient from "./apiClient";
import API_CONFIG from "../config/api.config";
import SecureStorage from "./secureStorage";
import {
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "../types/api";
import { User } from "../types/models";
import { MOCK_PATIENT_PROFILE } from "./mockData";

export const authService = {
  /**
   * Request 4-digit verification OTP via SMS
   */
  async sendOtp(phone: string): Promise<SendOtpResponse> {
    try {
      const response = await apiClient.post<SendOtpResponse>(
        API_CONFIG.ENDPOINTS.AUTH.SEND_OTP,
        { phone },
        { skipAuth: true }
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
      console.log("[authService.sendOtp] Backend offline, using mock OTP session for:", phone);
    }

    // Mock fallback response
    return {
      otpSent: true,
      cooldownSeconds: 30,
      attemptId: `att_${Date.now()}`,
      testOtp: "1234",
    };
  },

  /**
   * Verify entered 4-digit OTP and obtain authenticated session
   */
  async verifyOtp(params: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    try {
      const response = await apiClient.post<VerifyOtpResponse>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
        params,
        { skipAuth: true }
      );
      if (response.data?.token) {
        await SecureStorage.setToken(response.data.token);
        if (response.data.refreshToken) {
          await SecureStorage.setRefreshToken(response.data.refreshToken);
        }
        return response.data;
      }
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
      console.log("[authService.verifyOtp] Backend offline, returning verified mock session");
    }

    // Mock fallback session
    const mockToken = `jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await SecureStorage.setToken(mockToken);

    const mockUser: User = {
      id: "usr_pat_01",
      name: params.fullName || "Rachna",
      phone: params.phone,
      role: "PATIENT",
      patientId: "pat_001",
      isActive: true,
    };

    return {
      token: mockToken,
      refreshToken: `rf_${mockToken}`,
      user: mockUser,
      patient: MOCK_PATIENT_PROFILE,
    };
  },

  /**
   * Resend OTP with cooldown verification
   */
  async resendOtp(phone: string): Promise<SendOtpResponse> {
    try {
      const response = await apiClient.post<SendOtpResponse>(
        API_CONFIG.ENDPOINTS.AUTH.RESEND_OTP,
        { phone },
        { skipAuth: true }
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    return {
      otpSent: true,
      cooldownSeconds: 30,
    };
  },

  /**
   * Fetch current authenticated session
   */
  async getMe(): Promise<User | null> {
    const token = await SecureStorage.getToken();
    if (!token) return null;

    try {
      const response = await apiClient.get<User>(API_CONFIG.ENDPOINTS.AUTH.ME);
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        return null;
      }
    }

    // Fallback user if token exists in storage
    return {
      id: "usr_pat_01",
      name: "Rachna",
      phone: "+91 98765 43210",
      role: "PATIENT",
      patientId: "pat_001",
      isActive: true,
    };
  },

  /**
   * Terminate current session securely
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
    } catch (e) {
      // Best effort remote logout
    } finally {
      await SecureStorage.clearAllTokens();
    }
  },
};

export default authService;
