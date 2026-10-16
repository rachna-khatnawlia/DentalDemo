import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AuthWrapperContainer from "../../components/AuthWrapperContainer";
import TextInputComp from "../../components/TextInputComp";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";
import ButtonComp from "../../components/ButtonComp";
import AuthHeader from "../../components/AuthHeader";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import NavigationStrings from "../../navigation/NavigationStrings";
import ValidationSchema from "../../schemas/validation";
import authService from "../../services/authService";
import { useDispatch } from "react-redux";
import { onLogin, setUser } from "../../redux/slice/authSlice";
import ToastService from "../../services/toastService";

const Login = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
  };

  const handleGetOtp = async () => {
    const validation = ValidationSchema.validatePhone(phoneNumber);
    if (!validation.isValid) {
      ToastService.error(
        validation.error || "Please enter your mobile number.",
        "Mobile Number Required"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.sendOtp(validation.cleanValue!);
      setIsLoading(false);
      ToastService.success("Verification code sent to your mobile.", "OTP Sent");

      navigation.navigate(NavigationStrings.VERIFY_OTP, {
        flow: "login",
        phoneNumber: validation.cleanValue!,
        displayPhone: phoneNumber.trim(),
        cooldownSeconds: response.cooldownSeconds || 30,
      });
    } catch (error: any) {
      setIsLoading(false);
      const msg =
        error?.message || "Failed to send verification code. Please try again.";
      ToastService.error(msg, "Unable to Send OTP");
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    try {
      const res = await authService.verifyOtp({
        phone: "+1 555 019 2834",
        otp: "1234",
        flow: "login",
      });
      ToastService.success("Logged in with Demo Account", "Welcome to DentaCare");
      dispatch(onLogin(res.token));
      if (res.user) {
        dispatch(setUser(res.user));
      }
    } catch (e: any) {
      ToastService.info("Signed in via offline demo session", "Demo Mode");
      dispatch(onLogin("demo-access-token-123"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapperContainer>
      <AuthHeader title="DentaCare" des="Healthy Smiles, Brighter Tomorrows" />
      <View style={styles.formContainer}>
        <TextInputComp
          label="Mobile Number"
          placeholder="Enter mobile number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          maxLength={14}
        />

        {/* Primary Get OTP Button with Loading State */}
        <ButtonComp
          title={isLoading ? "Sending OTP..." : "Get OTP"}
          onPress={handleGetOtp}
          disabled={isLoading}
          style={styles.getOtpBtn}
        />

        {/* Quick Demo Access Button */}
        <ButtonComp
          title="⚡ Quick Demo Access"
          onPress={handleQuickDemo}
          disabled={isLoading}
          style={styles.demoBtn}
          textStyle={{ color: colors.primaryBlue }}
        />

        {/* Link to Register Page */}
        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>Don't have an account? </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(NavigationStrings.REGISTER)}
          >
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthWrapperContainer>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(10),
  },
  getOtpBtn: {
    backgroundColor: colors.primaryBlue,
    marginTop: moderateScaleVertical(10),
  },
  demoBtn: {
    backgroundColor: colors.primaryBlueLight,
    borderWidth: 1,
    borderColor: colors.bannerBorder,
    marginTop: moderateScaleVertical(12),
    elevation: 0,
    shadowOpacity: 0,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: moderateScaleVertical(24),
  },
  registerPrompt: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  registerLink: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.primaryBlue,
  },
});

export default Login;
