import imagepath from "../constants/imagepath";
import {
  Doctor,
  DoctorReview,
  DoctorService,
  ServiceCategory,
  Appointment,
  PatientProfile,
  PatientSummary,
  NotificationItem,
  NotificationPreferences,
} from "../types/models";

export const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: "1",
    title: "General\nDentistry",
    icon: "tooth-outline",
    iconSet: "mci",
    description: "Routine checkups, digital diagnostics and cleanings",
    servicesCount: 6,
  },
  {
    id: "2",
    title: "Teeth\nCleaning",
    icon: "sparkles-outline",
    iconSet: "ion",
    description: "Ultrasonic scaling, stain removal, and polishing",
    servicesCount: 4,
  },
  {
    id: "3",
    title: "Orthodontics",
    icon: "tooth",
    iconSet: "mci",
    description: "Clear aligners, metal and ceramic braces",
    servicesCount: 5,
  },
  {
    id: "4",
    title: "Cosmetic\nDentistry",
    icon: "emoticon-happy-outline",
    iconSet: "mci",
    description: "Teeth whitening, composite veneers and smile design",
    servicesCount: 8,
  },
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: "doc_01",
    name: "Dr. Rohan Mehta",
    degree: "BDS, MDS - Orthodontist",
    specialty: "Orthodontics & Aligners",
    experienceYears: 8,
    rating: "4.8",
    reviewsCount: "320",
    distance: "2 km away",
    location: "SmileCare Dental Clinic, New Delhi",
    image: imagepath.dentistRohan,
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
    about:
      "Dr. Rohan Mehta is a highly experienced orthodontist with over 8 years of experience in braces, aligners and smile correction treatments. Having treated over 2,500+ patients with cutting edge 3D intraoral scanners and digital precision dentistry.",
    patientsCount: "2,500+",
    isAvailableToday: true,
  },
  {
    id: "doc_02",
    name: "Dr. Priya Sharma",
    degree: "BDS - Cosmetic Dentist",
    specialty: "Cosmetic & Restorative Dentistry",
    experienceYears: 6,
    rating: "4.7",
    reviewsCount: "210",
    distance: "3 km away",
    location: "DentArc Aesthetic Center, New Delhi",
    image: imagepath.dentistPriya,
    avatarUrl: "https://images.unsplash.com/photo-1594824813588-e9f0290538a0?w=400",
    about:
      "Dr. Priya Sharma specializes in aesthetic smile transformations, laser teeth whitening, ceramic veneers, and painless root canal treatments.",
    patientsCount: "1,800+",
    isAvailableToday: true,
  },
];

export const MOCK_DOCTOR_SERVICES: DoctorService[] = [
  { id: "srv_01", name: "Teeth Cleaning", icon: "tooth-outline", price: "$120", durationMinutes: 45 },
  { id: "srv_02", name: "Braces Treatment", icon: "tooth-outline", price: "$1,200", durationMinutes: 60 },
  { id: "srv_03", name: "Clear Aligners (Invisalign)", icon: "tooth-outline", price: "$2,400", durationMinutes: 45 },
  { id: "srv_04", name: "Smile Correction", icon: "emoticon-happy-outline", price: "$850", durationMinutes: 60 },
  { id: "srv_05", name: "General Dentistry Checkup", icon: "tooth-outline", price: "$60", durationMinutes: 30 },
];

export const MOCK_DOCTOR_REVIEWS: DoctorReview[] = [
  {
    id: "r1",
    doctorId: "doc_01",
    author: "Ananya Iyer",
    rating: 5,
    date: "2 days ago",
    comment: "Dr. Rohan was extremely gentle during my aligner fitting. Highly recommend him for smile corrections!",
  },
  {
    id: "r2",
    doctorId: "doc_01",
    author: "Karan Singhania",
    rating: 5,
    date: "1 week ago",
    comment: "State of the art clinic and wonderful staff. My braces treatment has shown great results.",
  },
];

export const MOCK_PATIENT_PROFILE: PatientProfile = {
  id: "pat_001",
  userId: "usr_001",
  firstName: "Patient",
  lastName: "User",
  phone: "+1 (555) 019-2834",
  email: "patient@dentacare.com",
  gender: "Female",
  dob: "15 Aug 1995",
  bloodGroup: "O+",
  city: "New Delhi",
  aadhaarNumber: "4582 9102 3456",
  isAadhaarVerified: true,
  membershipTier: "Platinum",
  visitsCount: 4,
  rewardPoints: 450,
  insurancePolicyNumber: "SG-99420",
  insuranceProvider: "SmileGuard Health",
  insuranceCoveragePercent: 80,
  avatarUrl: "user_arjun.jpg",
};

export const MOCK_UPCOMING_APPOINTMENT: Appointment = {
  id: "apt_101",
  patientId: "pat_001",
  doctorId: "doc_01",
  doctorName: "Dr. Rohan Mehta",
  doctorSpecialty: "BDS, MDS - Orthodontist",
  doctorImage: imagepath.dentistRohan,
  serviceId: "srv_01",
  serviceName: "Teeth Cleaning & Assessment",
  servicePrice: "$120",
  clinicName: "SmileCare Dental Clinic",
  clinicAddress: "Connaught Place, New Delhi",
  scheduledDate: "2026-10-06",
  scheduledTime: "10:00 AM",
  notes: "Routine semi-annual cleaning and sensitivity assessment.",
  status: "CONFIRMED",
  tokenNumber: 4,
  createdAt: "2026-10-01T10:00:00Z",
};

export const MOCK_PATIENT_SUMMARY: PatientSummary = {
  patient: MOCK_PATIENT_PROFILE,
  upcomingAppointment: MOCK_UPCOMING_APPOINTMENT,
  recentPrescriptionsCount: 3,
  unseenReportsCount: 2,
  activeRewardPoints: 450,
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    category: "appointments",
    title: "Appointment Confirmed! 🦷",
    message: "Your appointment with Dr. Rohan Mehta for Teeth Cleaning & Assessment is confirmed for Mon, 6 Oct at 10:00 AM.",
    time: "25m ago",
    dateGroup: "Today",
    isRead: false,
    iconType: "calendar",
    actionLabel: "View Details",
    actionScreen: "DoctorDetail",
  },
  {
    id: "notif_2",
    category: "reminders",
    title: "Time for 6-Month Dental Checkup",
    message: "It has been 6 months since your last scaling. Keep your enamel protected by booking your routine cleaning.",
    time: "2h ago",
    dateGroup: "Today",
    isRead: false,
    iconType: "checkup",
    actionLabel: "Book Now",
    actionScreen: "BookAppointment",
  },
  {
    id: "notif_3",
    category: "offers",
    title: "You Earned 150 Smile Points! 🎁",
    message: "Congratulations! Your DentaCare Platinum Tier benefits have unlocked a 20% discount coupon on clear aligners.",
    time: "5h ago",
    dateGroup: "Today",
    isRead: false,
    iconType: "reward",
    actionLabel: "View Rewards",
    actionScreen: "Profile",
  },
  {
    id: "notif_4",
    category: "reports",
    title: "Digital 3D OPG Scan Ready 📄",
    message: "Dr. Priya Sharma has uploaded your digital panoramic X-Ray scan report to your dental records.",
    time: "Yesterday, 4:15 PM",
    dateGroup: "Yesterday",
    isRead: true,
    iconType: "scan",
    actionLabel: "View Records",
    actionScreen: "Profile",
  },
  {
    id: "notif_5",
    category: "reminders",
    title: "Post-Treatment Oral Care Tip 💡",
    message: "Remember to rinse gently with warm salt water and avoid cold beverages for 24 hours after your treatment.",
    time: "Yesterday, 11:30 AM",
    dateGroup: "Yesterday",
    isRead: true,
    iconType: "tip",
  },
];

export const MOCK_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  appointmentReminders: true,
  smsAlerts: true,
  emailAlerts: false,
  promotionalOffers: true,
};
