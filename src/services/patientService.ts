import apiClient from "./apiClient";
import API_CONFIG from "../config/api.config";
import { PatientProfile, PatientSummary } from "../types/models";
import { MOCK_PATIENT_PROFILE, MOCK_PATIENT_SUMMARY } from "./mockData";

export const patientService = {
  /**
   * Fetch current authenticated patient's profile details
   */
  async getProfile(): Promise<PatientProfile> {
    try {
      const response = await apiClient.get<PatientProfile>(
        API_CONFIG.ENDPOINTS.PATIENTS.ME
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    return MOCK_PATIENT_PROFILE;
  },

  /**
   * Update patient profile information
   */
  async updateProfile(data: Partial<PatientProfile>): Promise<PatientProfile> {
    try {
      const response = await apiClient.put<PatientProfile>(
        API_CONFIG.ENDPOINTS.PATIENTS.ME,
        data
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
      console.log("[patientService.updateProfile] Server offline, updating mock patient");
    }

    // Merge changes with mock profile
    Object.assign(MOCK_PATIENT_PROFILE, data);
    return { ...MOCK_PATIENT_PROFILE };
  },

  /**
   * Fetch home/profile summary (visits, upcoming appointment)
   */
  async getSummary(): Promise<PatientSummary> {
    try {
      const response = await apiClient.get<PatientSummary>(
        API_CONFIG.ENDPOINTS.PATIENTS.SUMMARY
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    return MOCK_PATIENT_SUMMARY;
  },

  /**
   * Upload Aadhaar or medical record document
   */
  async uploadDocument(formData: FormData): Promise<{ documentId: string; url: string }> {
    try {
      const response = await apiClient.post<{ documentId: string; url: string }>(
        API_CONFIG.ENDPOINTS.PATIENTS.DOCUMENTS,
        formData
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    return {
      documentId: `doc_${Date.now()}`,
      url: "https://dentacare.storage.example/docs/aadhaar_verified.jpg",
    };
  },
};

export default patientService;
