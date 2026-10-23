import apiClient from "./apiClient";
import API_CONFIG from "../config/api.config";
import { Appointment, TimeSlot } from "../types/models";
import { CreateAppointmentRequest } from "../types/api";
import { MOCK_APPOINTMENTS_LIST, MOCK_DOCTORS } from "./mockData";
import imagepath from "../constants/imagepath";

const DEFAULT_SLOTS: TimeSlot[] = [
  { time: "10:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: false }, // Simulates booked slot
  { time: "12:00 PM", available: true },
  { time: "12:30 PM", available: true },
  { time: "02:00 PM", available: true },
  { time: "02:30 PM", available: false }, // Simulates booked slot
  { time: "03:00 PM", available: true },
  { time: "03:30 PM", available: true },
  { time: "04:00 PM", available: true },
];

// Reactive in-memory appointment store initialized with realistic mock data
let appointmentsStore: Appointment[] = [...MOCK_APPOINTMENTS_LIST];
type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn("[appointmentService] Listener notification error:", e);
    }
  });
};

export const appointmentService = {
  /**
   * Subscribe to appointment changes (booking, rescheduling, cancellation)
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

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
   * Submit an appointment booking.
   * Authoritatively updates the appointments store and notifies subscribers.
   */
  async bookAppointment(request: CreateAppointmentRequest): Promise<Appointment> {
    const doctorObj = MOCK_DOCTORS.find((d) => d.id === request.doctorId) || MOCK_DOCTORS[0];

    try {
      const response = await apiClient.post<Appointment>(
        API_CONFIG.ENDPOINTS.APPOINTMENTS.CREATE,
        request
      );
      if (response.data) {
        appointmentsStore = [response.data, ...appointmentsStore];
        notifyListeners();
        return response.data;
      }
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
      console.log("[appointmentService.bookAppointment] Server offline, creating mock confirmed booking");
    }

    const confirmedAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: request.patientId || "pat_001",
      doctorId: request.doctorId,
      doctorName: doctorObj.name,
      doctorSpecialty: doctorObj.degree || doctorObj.specialty,
      doctorImage: doctorObj.image || imagepath.dentistRohan,
      serviceId: request.serviceId,
      serviceName: request.serviceId,
      servicePrice: "$120",
      clinicName: "Apex DentaCare Center",
      clinicAddress: doctorObj.location || "Connaught Place, New Delhi",
      branchArea: doctorObj.location || "Connaught Place, New Delhi",
      scheduledDate: request.date,
      scheduledTime: request.timeSlot,
      notes: request.notes,
      status: "CONFIRMED",
      tokenNumber: Math.floor(Math.random() * 10) + 1,
      createdAt: new Date().toISOString(),
      bookingFor: request.bookingFor || "SELF",
      patientName: request.patientName || "Patient User",
      patientAge: request.patientAge,
      patientGender: request.patientGender,
      patientAadhaar: request.patientAadhaar,
      patientRelation: request.patientRelation,
    };

    appointmentsStore = [confirmedAppointment, ...appointmentsStore];
    notifyListeners();
    return confirmedAppointment;
  },

  /**
   * Reschedule an appointment with a new date and time slot
   */
  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string,
    reason?: string
  ): Promise<Appointment> {
    try {
      const response = await apiClient.post<Appointment>(
        `/appointments/${appointmentId}/reschedule`,
        { date: newDate, timeSlot: newTime, reason }
      );
      if (response.data) {
        const updatedFromApi: Appointment = response.data;
        appointmentsStore = appointmentsStore.map((apt) =>
          apt.id === appointmentId ? updatedFromApi : apt
        );
        notifyListeners();
        return updatedFromApi;
      }
    } catch (e) {
      console.log("[appointmentService.rescheduleAppointment] Server offline, updating store locally");
    }

    const index = appointmentsStore.findIndex((apt) => apt.id === appointmentId);
    if (index === -1) {
      throw new Error("Appointment not found");
    }

    const target = appointmentsStore[index];
    const updatedAppointment: Appointment = {
      ...target,
      scheduledDate: newDate,
      scheduledTime: newTime,
      notes: reason ? `${target.notes || ""} [Rescheduled: ${reason}]`.trim() : target.notes,
      status: "CONFIRMED",
      updatedAt: new Date().toISOString(),
    };

    appointmentsStore[index] = updatedAppointment;
    notifyListeners();
    return updatedAppointment;
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
      if (response.success) {
        appointmentsStore = appointmentsStore.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: "CANCELLED" as const, updatedAt: new Date().toISOString() }
            : apt
        );
        notifyListeners();
        return true;
      }
    } catch (e: any) {
      if (!API_CONFIG.ENABLE_MOCK_FALLBACK) {
        throw e;
      }
    }

    appointmentsStore = appointmentsStore.map((apt) => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          status: "CANCELLED" as const,
          notes: reason ? `${apt.notes || ""} [Cancelled: ${reason}]`.trim() : apt.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return apt;
    });

    notifyListeners();
    return true;
  },

  /**
   * Fetch patient's earliest upcoming appointment for spotlight cards
   */
  async getUpcomingAppointment(): Promise<Appointment | null> {
    const upcoming = appointmentsStore.find(
      (apt) => apt.status === "CONFIRMED" || apt.status === "PENDING"
    );
    return upcoming || null;
  },

  /**
   * Fetch all appointments (both upcoming, completed, and cancelled)
   */
  async getMyAppointments(): Promise<Appointment[]> {
    return [...appointmentsStore];
  },

  /**
   * Fetch completed past checkups
   */
  async getPastCheckups(): Promise<Appointment[]> {
    return appointmentsStore.filter((apt) => apt.status === "COMPLETED");
  },
};

export default appointmentService;
