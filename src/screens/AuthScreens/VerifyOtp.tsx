import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";
import { onLogin, setUser } from "../../redux/slice/authSlice";
import AuthWrapperContainer from "../../components/AuthWrapperContainer";
import ButtonComp from "../../components/ButtonComp";
import AuthHeader from "../../components/AuthHeader";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";
import ValidationSchema from "../../schemas/validation";
import authService from "../../services/authService";
import ToastService from "../../services/toastService";

const OTP_LENGTH = 4;
const MAX_RESEND_ATTEMPTS = 3;

const VerifyOtp = ({ navigation, route }: any) => {
  const dispatch = useDispatch();
  const flow = route?.params?.flow || "login";
  const phoneNumber = route?.params?.phoneNumber || "+15550192834";
  const displayPhone = route?.params?.displayPhone || "your mobile number";
  const fullName = route?.params?.fullName || "User";
  const initialCooldown = route?.params?.cooldownSeconds || 30;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(initialCooldown);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev: number) => prev - 1);
      }, 1000);
    } else {
      if (resendCount < MAX_RESEND_ATTEMPTS) {
        setCanResend(true);
      }
    }
    return () => clearInterval(interval);
  }, [timer, resendCount]);

  const handleOtpChange = (text: string, index: number) => {
    if (errorMessage) setErrorMessage(null);
    const cleanText = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanText.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input box if a digit is entered
    if (cleanText && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 4 digits are entered
    if (cleanText && index === OTP_LENGTH - 1) {
      const fullCode = newOtp.join("");
      if (fullCode.length === OTP_LENGTH) {
        executeVerification(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Backspace: move focus to previous input if current is empty
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || resendCount >= MAX_RESEND_ATTEMPTS) return;

    try {
      setOtp(["", "", "", ""]);
      setTimer(30);
      setCanResend(false);
      setResendCount((prev) => prev + 1);
      setErrorMessage(null);
      inputRefs.current[0]?.focus();

      await authService.resendOtp(phoneNumber);
      ToastService.success(
        `A new 4-digit verification code has been sent to ${displayPhone}.`,
        "OTP Sent"
      );
    } catch (e: any) {
      const msg = e?.message || "Failed to resend code. Please try again.";
      setErrorMessage(msg);
      ToastService.error(msg, "Resend Error");
    }
  };

  const executeVerification = async (enteredOtp: string) => {
    const validation = ValidationSchema.validateOtp(enteredOtp);
    if (!validation.isValid) {
      const err = validation.error || "Please enter the complete 4-digit code.";
      setErrorMessage(err);
      ToastService.warning(err, "Invalid Code");
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const response = await authService.verifyOtp({
        phone: phoneNumber,
        otp: validation.cleanValue!,
        flow,
        fullName,
      });

      setIsVerifying(false);
      ToastService.success("Mobile verification successful!", "Verified");

      // Successfully verified
      if (response.user) {
        dispatch(setUser(response.user));
      }
      dispatch(onLogin(response.token));
    } catch (error: any) {
      setIsVerifying(false);
      const msg = error?.message || "Invalid or expired OTP. Please try again.";
      setErrorMessage(msg);
      ToastService.error(msg, "Verification Failed");
      // Reset OTP inputs on error
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleManualVerify = () => {
    executeVerification(otp.join(""));
  };

  const formattedTimer = timer < 10 ? `00:0${timer}` : `00:${timer}`;

  return (
    <AuthWrapperContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <AuthHeader
            title="Verify Mobile OTP"
            des={`We sent a 4-digit code to\n${displayPhone}`}
            showBack={true}
            onBack={() => navigation.goBack()}
          />

          <View style={styles.contentContainer}>
            {/* 4-Box OTP Input */}
            <View style={styles.otpRow}>
              {otp.map((digit, index) => {
                const isFilled = digit.length > 0;
                return (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!isVerifying}
                    style={[
                      styles.otpBox,
                      isFilled && styles.otpBoxFilled,
                      Boolean(errorMessage) && styles.otpBoxError,
                    ]}
                  />
                );
              })}
            </View>

            {/* Resend Timer / Action */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={styles.resendActiveText}>Resend OTP</Text>
                </TouchableOpacity>
              ) : resendCount >= MAX_RESEND_ATTEMPTS ? (
                <Text style={styles.resendMaxText}>
                  Maximum OTP resend attempts reached. Please try again later.
                </Text>
              ) : (
                <Text style={styles.resendTimerText}>
                  Resend code in{" "}
                  <Text style={styles.timerHighlight}>{formattedTimer}</Text>
                </Text>
              )}
            </View>

            {/* Verify Button */}
            <ButtonComp
              title={isVerifying ? "Verifying..." : "Verify & Proceed"}
              onPress={handleManualVerify}
              disabled={isVerifying}
              style={styles.verifyBtn}
            />

            {/* Change wrong mobile number row */}
            <View style={styles.changeNumberRow}>
              <Text style={styles.changeNumberPrompt}>Entered wrong mobile no? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.changeNumberLink}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthWrapperContainer>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: moderateScaleVertical(40),
  },
  contentContainer: {
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(20),
    alignItems: "center",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: moderateScaleVertical(16),
  },
  otpBox: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(14),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgLight,
    textAlign: "center",
    fontSize: textScale(22),
    fontFamily: fontFamily.bold,
    color: colors.primaryBlue,
  },
  otpBoxFilled: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.primaryBlueSubtle,
  },
  otpBoxError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  resendContainer: {
    marginBottom: moderateScaleVertical(24),
  },
  resendTimerText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  timerHighlight: {
    fontFamily: fontFamily.semiBold,
    color: colors.primaryBlue,
  },
  resendActiveText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.primaryBlue,
  },
  resendMaxText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textMuted,
    textAlign: "center",
  },
  verifyBtn: {
    width: "100%",
    backgroundColor: colors.primaryBlue,
  },
  changeNumberRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: moderateScaleVertical(20),
  },
  changeNumberPrompt: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  changeNumberLink: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.primaryBlue,
  },
});

export default VerifyOtp;
