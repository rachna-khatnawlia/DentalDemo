import {
  User,
  PatientProfile,
  PatientSummary,
  Doctor,
  DoctorDetail,
  DoctorService,
  DoctorReview,
  ServiceCategory,
  Appointment,
  TimeSlot,
  NotificationItem,
  NotificationPreferences,
  DentalDocument,
} from "./models";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorCode?: string;
  statusCode?: number;
}

// Authentication Payloads
export interface SendOtpRequest {
  phone: string;
  countryCode?: string;
}

export interface SendOtpResponse {
  otpSent: boolean;
  cooldownSeconds: number;
  attemptId?: string;
  testOtp?: string; // only provided in dev environments
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  flow: "login" | "register";
  fullName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface VerifyOtpResponse {
  token: string;
  refreshToken?: string;
  user: User;
  patient?: PatientProfile;
}

export interface RegisterPatientRequest {
  fullName: string;
  phone: string;
  email?: string;
}

// Appointment Payloads
export interface GetSlotsResponse {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
}

export interface CreateAppointmentRequest {
  doctorId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  notes?: string;
  patientId?: string;
}

export interface CreateAppointmentResponse {
  appointment: Appointment;
  confirmationCode: string;
}

// Patient Payloads
export interface UpdatePatientProfileRequest {
  firstName: string;
  lastName: string;
  email?: string;
  gender?: "Female" | "Male" | "Other";
  dob?: string;
  bloodGroup?: string;
  city?: string;
  aadhaarNumber?: string;
}
