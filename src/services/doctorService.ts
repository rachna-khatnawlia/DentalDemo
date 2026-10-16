import apiClient from "./apiClient";
import API_CONFIG from "../config/api.config";
import { Doctor, DoctorReview, DoctorService } from "../types/models";
import {
  MOCK_DOCTORS,
  MOCK_DOCTOR_REVIEWS,
  MOCK_DOCTOR_SERVICES,
} from "./mockData";

export interface DoctorFilterParams {
  categoryId?: string;
  query?: string;
  city?: string;
}

export const doctorService = {
  /**
   * Fetch list of dentists with optional category and search filters
   */
  async getDoctors(params?: DoctorFilterParams): Promise<Doctor[]> {
    try {
      const response = await apiClient.get<Doctor[]>(
        API_CONFIG.ENDPOINTS.DOCTORS.LIST,
        { params }
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
      console.log("[doctorService] Falling back to mock data:", e?.message || e);
    }

    // Filter mock data locally
    let results = [...MOCK_DOCTORS];
    if (params?.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      results = results.filter(
        (doc) =>
          doc.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.degree.toLowerCase().includes(q) ||
          doc.location.toLowerCase().includes(q)
      );
    }

    return results;
  },

  /**
   * Fetch doctor details by ID
   */
  async getDoctorById(id: string): Promise<Doctor> {
    try {
      const response = await apiClient.get<Doctor>(
        API_CONFIG.ENDPOINTS.DOCTORS.DETAIL(id)
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    const found = MOCK_DOCTORS.find((d) => d.id === id);
    return found || MOCK_DOCTORS[0];
  },

  /**
   * Fetch services and treatment pricing for a specific doctor
   */
  async getDoctorServices(doctorId: string): Promise<DoctorService[]> {
    try {
      const response = await apiClient.get<DoctorService[]>(
        API_CONFIG.ENDPOINTS.DOCTORS.SERVICES(doctorId)
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    return MOCK_DOCTOR_SERVICES;
  },

  /**
   * Fetch verified patient reviews for a doctor
   */
  async getDoctorReviews(doctorId: string): Promise<DoctorReview[]> {
    try {
      const response = await apiClient.get<DoctorReview[]>(
        API_CONFIG.ENDPOINTS.DOCTORS.REVIEWS(doctorId)
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    return MOCK_DOCTOR_REVIEWS;
  },
};

export default doctorService;
