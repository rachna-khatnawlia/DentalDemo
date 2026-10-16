import apiClient from "./apiClient";
import API_CONFIG from "../config/api.config";
import { Appointment, TimeSlot } from "../types/models";
import { CreateAppointmentRequest } from "../types/api";
import { MOCK_UPCOMING_APPOINTMENT } from "./mockData";

const DEFAULT_SLOTS: TimeSlot[] = [
  { time: "10:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: false }, // Simulates booked slot
  { time: "12:00 PM", available: true },
  { time: "12:30 PM", available: true },
  { time: "2:00 PM", available: true },
  { time: "2:30 PM", available: false }, // Simulates booked slot
  { time: "3:00 PM", available: true },
];

export const appointmentService = {
  /**
   * Fetch real-time slot availability for a doctor on a specific date
   */
  async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    try {
      const response = await apiClient.get<{ slots: TimeSlot[] }>(
        API_CONFIG.ENDPOINTS.APPOINTMENTS.SLOTS,
        { params: { doctorId, date } }
      );
      if (response.data?.slots) return response.data.slots;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
      console.log("[appointmentService.getAvailableSlots] Server offline, using fallback slots");
    }

    return DEFAULT_SLOTS;
  },

  /**
   * Submit an appointment booking to the backend.
   * Backend performs authoritative slot conflict check.
   */
  async bookAppointment(request: CreateAppointmentRequest): Promise<Appointment> {
    try {
      const response = await apiClient.post<Appointment>(
        API_CONFIG.ENDPOINTS.APPOINTMENTS.CREATE,
        request
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
      console.log("[appointmentService.bookAppointment] Server offline, creating mock confirmed booking");
    }

    // Mock confirmed appointment returned when server is offline
    const confirmedAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: request.patientId || "pat_001",
      doctorId: request.doctorId,
      doctorName: "Dr. Rohan Mehta",
      doctorSpecialty: "Orthodontist",
      serviceId: request.serviceId,
      serviceName: request.serviceId,
      clinicName: "SmileCare Dental Clinic",
      clinicAddress: "Connaught Place, New Delhi",
      scheduledDate: request.date,
      scheduledTime: request.timeSlot,
      notes: request.notes,
      status: "CONFIRMED",
      tokenNumber: Math.floor(Math.random() * 10) + 1,
      createdAt: new Date().toISOString(),
    };

    return confirmedAppointment;
  },

  /**
   * Fetch patient's upcoming appointment for spotlight display
   */
  async getUpcomingAppointment(): Promise<Appointment | null> {
    try {
      const response = await apiClient.get<Appointment>(
        `${API_CONFIG.ENDPOINTS.APPOINTMENTS.LIST}/upcoming`
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        return null;
      }
    }

    return MOCK_UPCOMING_APPOINTMENT;
  },

  /**
   * Fetch all appointment history for current patient
   */
  async getMyAppointments(): Promise<Appointment[]> {
    try {
      const response = await apiClient.get<Appointment[]>(
        API_CONFIG.ENDPOINTS.APPOINTMENTS.LIST
      );
      if (response.data) return response.data;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    return [MOCK_UPCOMING_APPOINTMENT];
  },

  /**
   * Cancel an existing appointment
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId),
        { reason }
      );
      return response.success;
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
      return true;
    }
  },
};

export default appointmentService;
