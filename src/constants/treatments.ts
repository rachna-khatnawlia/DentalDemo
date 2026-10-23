import { Doctor } from "../types/models";
import { MOCK_DOCTORS } from "../services/mockData";

export interface TreatmentOption {
  id: string;
  name: string;
  department: string;
  category: "all" | "preventive" | "ortho" | "surgery" | "endo" | "cosmetic";
  specialtyTag: string;
  icon: string;
  iconSet: "mci" | "ion";
  price: string;
  duration: string;
  recommendedDoctorId: string;
  recommendedDoctorName: string;
  description: string;
}

export const TREATMENTS_CATALOG: TreatmentOption[] = [
  {
    id: "trt_01",
    name: "Teeth Cleaning & Scaling",
    department: "Preventive Dentistry",
    category: "preventive",
    specialtyTag: "Ultrasonic scaling & enamel polishing",
    icon: "sparkles",
    iconSet: "ion",
    price: "$120",
    duration: "45 mins",
    recommendedDoctorId: "doc_04",
    recommendedDoctorName: "Dr. Sneha Roy",
    description: "Deep ultrasonic cleaning to remove plaque, tartar, and coffee stains, followed by fluoride polishing.",
  },
  {
    id: "trt_02",
    name: "Clear Aligners (Invisalign®)",
    department: "Orthodontics & Aligners",
    category: "ortho",
    specialtyTag: "3D digital scans & invisible aligners",
    icon: "tooth",
    iconSet: "mci",
    price: "$2,400",
    duration: "45 mins",
    recommendedDoctorId: "doc_01",
    recommendedDoctorName: "Dr. Rohan Sharma",
    description: "Discreet and removable clear trays engineered with 3D digital planning to straighten crooked or crowded teeth.",
  },
  {
    id: "trt_03",
    name: "Braces Treatment",
    department: "Orthodontics & Braces",
    category: "ortho",
    specialtyTag: "Ceramic & metal brackets alignment",
    icon: "medical-bag",
    iconSet: "mci",
    price: "$1,200",
    duration: "60 mins",
    recommendedDoctorId: "doc_01",
    recommendedDoctorName: "Dr. Rohan Sharma",
    description: "Comprehensive orthodontic care correcting severe bite misalignments, spacing, and structural crookedness.",
  },
  {
    id: "trt_04",
    name: "Root Canal Therapy (RCT)",
    department: "Endodontics & Restorative",
    category: "endo",
    specialtyTag: "Painless single-visit infected pulp therapy",
    icon: "shield-checkmark",
    iconSet: "ion",
    price: "$450",
    duration: "50 mins",
    recommendedDoctorId: "doc_02",
    recommendedDoctorName: "Dr. Priya Mehta",
    description: "Modern rotary endodontics preserving your natural tooth by removing decay, infected nerve tissue, and sealing.",
  },
  {
    id: "trt_05",
    name: "Dental Implants & Surgery",
    department: "Oral & Maxillofacial Surgery",
    category: "surgery",
    specialtyTag: "Titanium tooth root replacement",
    icon: "fitness",
    iconSet: "ion",
    price: "$1,800",
    duration: "60 mins",
    recommendedDoctorId: "doc_03",
    recommendedDoctorName: "Dr. Kabir Verma",
    description: "Biocompatible titanium implants crowned with custom ceramic teeth for lifelong chewing strength.",
  },
  {
    id: "trt_06",
    name: "Smile Correction & Veneers",
    department: "Cosmetic Dentistry",
    category: "cosmetic",
    specialtyTag: "Porcelain veneers & aesthetic smile design",
    icon: "happy-outline",
    iconSet: "ion",
    price: "$850",
    duration: "60 mins",
    recommendedDoctorId: "doc_02",
    recommendedDoctorName: "Dr. Priya Mehta",
    description: "Hollywood smile makeover with custom ultra-thin porcelain veneers, closing gaps and reshaping teeth.",
  },
  {
    id: "trt_07",
    name: "Wisdom Tooth Extraction",
    department: "Oral & Maxillofacial Surgery",
    category: "surgery",
    specialtyTag: "Painless extraction of impacted molars",
    icon: "medkit-outline",
    iconSet: "ion",
    price: "$250",
    duration: "40 mins",
    recommendedDoctorId: "doc_03",
    recommendedDoctorName: "Dr. Kabir Verma",
    description: "Gentle surgical removal of painful, impacted, or crowded wisdom teeth using local anesthesia.",
  },
  {
    id: "trt_08",
    name: "General Dentistry Checkup",
    department: "General & Preventive Care",
    category: "preventive",
    specialtyTag: "Comprehensive intraoral exam & X-Rays",
    icon: "search-outline",
    iconSet: "ion",
    price: "$60",
    duration: "30 mins",
    recommendedDoctorId: "doc_04",
    recommendedDoctorName: "Dr. Sneha Roy",
    description: "Routine examination including intraoral digital camera screening, gum depth analysis, and consultation.",
  },
];

export const getAutoAssignedDoctor = (
  serviceName: string,
  doctorIdOverride?: string
): Doctor => {
  if (doctorIdOverride) {
    const found = MOCK_DOCTORS.find((d) => d.id === doctorIdOverride);
    if (found) return found;
  }

  const treatment = TREATMENTS_CATALOG.find(
    (t) => t.name.toLowerCase() === serviceName.toLowerCase()
  );
  if (treatment?.recommendedDoctorId) {
    const matched = MOCK_DOCTORS.find(
      (d) => d.id === treatment.recommendedDoctorId
    );
    if (matched) return matched;
  }

  const s = serviceName.toLowerCase();
  if (s.includes("brace") || s.includes("aligner") || s.includes("invisalign") || s.includes("ortho")) {
    return MOCK_DOCTORS.find((d) => d.id === "doc_01") || MOCK_DOCTORS[0];
  }
  if (s.includes("implant") || s.includes("surgery") || s.includes("extract") || s.includes("wisdom")) {
    return MOCK_DOCTORS.find((d) => d.id === "doc_03") || MOCK_DOCTORS[0];
  }
  if (
    s.includes("smile") ||
    s.includes("veneer") ||
    s.includes("root canal") ||
    s.includes("rct") ||
    s.includes("cosmetic")
  ) {
    return MOCK_DOCTORS.find((d) => d.id === "doc_02") || MOCK_DOCTORS[0];
  }

  return MOCK_DOCTORS.find((d) => d.id === "doc_04") || MOCK_DOCTORS[0];
};
