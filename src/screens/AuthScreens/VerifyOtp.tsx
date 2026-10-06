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
} from "react-native";
import { useDispatch } from "react-redux";
import { onLogin } from "../../redux/slice/authSlice";
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
import NavigationStrings from "../../navigation/NavigationStrings";

const OTP_LENGTH = 4;

const VerifyOtp = ({ navigation, route }: any) => {
  const dispatch = useDispatch();
  const flow = route?.params?.flow || "register";
  const phoneNumber = route?.params?.phoneNumber || "your mobile number";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanText.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input box if a digit is entered
    if (cleanText && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Backspace: move focus to previous input if current is empty
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(["", "", "", ""]);
    setTimer(30);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    Alert.alert("OTP Resent", `A new 4-digit OTP has been sent to ${phoneNumber}.`);
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < OTP_LENGTH) {
      Alert.alert("Invalid OTP", "Please enter the complete 4-digit verification code.");
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      dispatch(onLogin("demo-mobile-user-token"));
    }, 500);
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
            des={`We sent a 4-digit code to\n${phoneNumber}`}
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
                    style={[styles.otpBox, isFilled && styles.otpBoxFilled]}
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
              onPress={handleVerify}
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
    marginBottom: moderateScaleVertical(24),
  },
  otpBox: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgLight,
    textAlign: "center",
    fontSize: textScale(22),
    fontFamily: fontFamily.bold,
    color: colors.primaryNavy,
  },
  otpBoxFilled: {
    borderColor: colors.primaryCyan,
    backgroundColor: colors.white,
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
    color: colors.primaryCyan,
  },
  resendActiveText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.primaryCyan,
  },
  verifyBtn: {
    width: "100%",
    backgroundColor: colors.primaryNavy,
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
    color: colors.primaryCyan,
  },
});

export default VerifyOtp;
