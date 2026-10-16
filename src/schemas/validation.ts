/**
 * Validation Schemas and helper functions for DentaCare Customer Mobile App.
 * Provides user-friendly error messages and prevents invalid submissions.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  cleanValue?: string;
}

export const ValidationSchema = {
  /**
   * Validates mobile number (Standard 10-digit format for India/US, or with country code)
   */
  validatePhone(rawPhone: string): ValidationResult {
    if (!rawPhone || !rawPhone.trim()) {
      return { isValid: false, error: "Please enter your mobile number." };
    }

    const clean = rawPhone.replace(/[^0-9]/g, "");

    // Handle 10-digit domestic phone number
    if (clean.length === 10) {
      // Must start with 6, 7, 8, or 9 for Indian cellular networks
      if (!/^[6-9]/.test(clean)) {
        return {
          isValid: false,
          error: "Mobile number must start with 6, 7, 8, or 9.",
        };
      }
      return { isValid: true, cleanValue: `+91${clean}` };
    }

    // Handle 12-digit with 91 prefix
    if (clean.length === 12 && clean.startsWith("91")) {
      const tenDigit = clean.slice(2);
      if (!/^[6-9]/.test(tenDigit)) {
        return {
          isValid: false,
          error: "Mobile number must start with 6, 7, 8, or 9.",
        };
      }
      return { isValid: true, cleanValue: `+${clean}` };
    }

    return {
      isValid: false,
      error: "Please enter a valid 10-digit mobile number.",
    };
  },

  /**
   * Validates user full name
   */
  validateFullName(name: string): ValidationResult {
    if (!name || !name.trim()) {
      return { isValid: false, error: "Please enter your full name." };
    }

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { isValid: false, error: "Name must be at least 2 characters long." };
    }

    if (trimmed.length > 60) {
      return { isValid: false, error: "Name cannot exceed 60 characters." };
    }

    // Ensure name contains letters, spaces, and standard hyphens/apostrophes
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
      return {
        isValid: false,
        error: "Name can only contain alphabetic characters.",
      };
    }

    return { isValid: true, cleanValue: trimmed };
  },

  /**
   * Validates 4-digit numeric verification OTP
   */
  validateOtp(otpArrayOrString: string[] | string): ValidationResult {
    const otp = Array.isArray(otpArrayOrString)
      ? otpArrayOrString.join("")
      : otpArrayOrString;

    if (!otp || otp.length < 4) {
      return { isValid: false, error: "Please enter the complete 4-digit OTP." };
    }

    if (!/^[0-9]{4}$/.test(otp)) {
      return { isValid: false, error: "OTP must contain only numbers." };
    }

    return { isValid: true, cleanValue: otp };
  },

  /**
   * Validates optional or required email address
   */
  validateEmail(email: string, required: boolean = false): ValidationResult {
    if (!email || !email.trim()) {
      if (required) {
        return { isValid: false, error: "Please enter your email address." };
      }
      return { isValid: true, cleanValue: "" };
    }

    const trimmed = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, error: "Please enter a valid email address." };
    }

    return { isValid: true, cleanValue: trimmed.toLowerCase() };
  },

  /**
   * Validates 12-digit Indian Aadhaar Government ID
   */
  validateAadhaar(aadhaar: string, required: boolean = false): ValidationResult {
    if (!aadhaar || !aadhaar.trim()) {
      if (required) {
        return { isValid: false, error: "Please enter your 12-digit Aadhaar number." };
      }
      return { isValid: true, cleanValue: "" };
    }

    const clean = aadhaar.replace(/[^0-9]/g, "");
    if (clean.length !== 12) {
      return {
        isValid: false,
        error: "Aadhaar number must be exactly 12 digits.",
      };
    }

    // Aadhaar cannot start with 0 or 1
    if (clean.startsWith("0") || clean.startsWith("1")) {
      return {
        isValid: false,
        error: "Invalid Aadhaar number (cannot begin with 0 or 1).",
      };
    }

    return { isValid: true, cleanValue: clean };
  },

  /**
   * Validates appointment booking parameters
   */
  validateBookingSelection(params: {
    service: string;
    date: string;
    time: string;
  }): ValidationResult {
    if (!params.service || !params.service.trim()) {
      return { isValid: false, error: "Please select a dental service." };
    }
    if (!params.date || !params.date.trim()) {
      return { isValid: false, error: "Please select an appointment date." };
    }
    if (!params.time || !params.time.trim()) {
      return { isValid: false, error: "Please select a preferred time slot." };
    }

    return { isValid: true };
  },
};

export default ValidationSchema;
