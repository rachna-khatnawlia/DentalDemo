/**
 * Authoritative data models for DentaCare Customer Mobile App.
 * These types match the PostgreSQL/MySQL Sequelize schemas from the Node.js backend.
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "PATIENT" | "DOCTOR" | "CLINIC_ADMIN" | "SUPER_ADMIN";
  patientId?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: "Female" | "Male" | "Other";
  dob: string;
  bloodGroup: string;
  city: string;
  aadhaarNumber?: string;
  isAadhaarVerified: boolean;
  visitsCount: number;
  avatarUrl?: string;
}

export interface PatientSummary {
  patient: PatientProfile;
  upcomingAppointment: Appointment | null;
  recentPrescriptionsCount: number;
  unseenReportsCount: number;
}

export interface Doctor {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  experienceYears: number;
  rating: number | string;
  reviewsCount: number | string;
  distance?: string;
  location: string;
  clinicId?: string;
  clinicName?: string;
  image?: any;
  avatarUrl?: string;
  about?: string;
  patientsCount?: string;
  isAvailableToday?: boolean;
}

export type DoctorDetail = Doctor;


export interface DoctorService {
  id: string;
  name: string;
  icon?: string;
  price: string;
  durationMinutes?: number;
  description?: string;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  patientAvatar?: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  icon: string;
  iconSet: "ion" | "mci";
  description?: string;
  servicesCount?: number;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorImage?: any;
  serviceId: string;
  serviceName: string;
  servicePrice?: string;
  clinicName: string;
  clinicAddress: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // e.g. "10:00 AM"
  notes?: string;
  status: AppointmentStatus;
  tokenNumber?: number;
  createdAt?: string;
  updatedAt?: string;
  diagnosis?: string;
  treatmentSummary?: string;
  prescriptions?: string[];
  followUpAdvice?: string;
  branchArea?: string;

  // Patient Booking Info (Self vs Someone Else)
  bookingFor?: "SELF" | "OTHER";
  patientName?: string;
  patientAge?: number | string;
  patientGender?: "Female" | "Male" | "Other";
  patientAadhaar?: string;
  patientRelation?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  isPast?: boolean;
}

export interface NotificationItem {
  id: string;
  category: "appointments" | "reminders" | "reports" | "offers";
  title: string;
  message: string;
  time: string;
  dateGroup: "Today" | "Yesterday" | "Earlier";
  isRead: boolean;
  iconType: "calendar" | "checkup" | "scan" | "tip";
  actionLabel?: string;
  actionScreen?: string;
  actionParams?: any;
  createdAt?: string;
}

export interface NotificationPreferences {
  appointmentReminders: boolean;
  smsAlerts: boolean;
  emailAlerts: boolean;
  promotionalOffers: boolean;
}

export interface DentalDocument {
  id: string;
  patientId: string;
  documentType: "AADHAAR_FRONT" | "AADHAAR_BACK" | "OPG_SCAN" | "PRESCRIPTION";
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  verified: boolean;
  uploadedAt: string;
}
