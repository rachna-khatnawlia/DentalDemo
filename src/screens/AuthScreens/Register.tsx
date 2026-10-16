import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AuthWrapperContainer from "../../components/AuthWrapperContainer";
import TextInputComp from "../../components/TextInputComp";
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
import ValidationSchema from "../../schemas/validation";
import authService from "../../services/authService";
import ToastService from "../../services/toastService";

const Register = ({ navigation }: any) => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validate Full Name
    const nameVal = ValidationSchema.validateFullName(fullName);
    if (!nameVal.isValid) {
      const err = nameVal.error || "Please enter your full name.";
      ToastService.error(err, "Name Required");
      return;
    }

    // Validate Phone Number
    const phoneVal = ValidationSchema.validatePhone(phoneNumber);
    if (!phoneVal.isValid) {
      const err = phoneVal.error || "Please enter your mobile number.";
      ToastService.error(err, "Mobile Number Required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.sendOtp(phoneVal.cleanValue!);
      setIsLoading(false);
      ToastService.success("OTP sent successfully to your mobile number.", "Code Sent");

      navigation.navigate(NavigationStrings.VERIFY_OTP, {
        flow: "register",
        phoneNumber: phoneVal.cleanValue!,
        displayPhone: phoneNumber.trim(),
        fullName: nameVal.cleanValue!,
        cooldownSeconds: response.cooldownSeconds || 30,
      });
    } catch (error: any) {
      setIsLoading(false);
      const msg = error?.message || "Failed to initiate registration. Please try again.";
      ToastService.error(msg, "Registration Error");
    }
  };

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
            title="Create Account"
            des="Sign up to find expert dentists and book appointments near you"
            showBack={true}
            onBack={() => navigation.goBack()}
          />

          <View style={styles.formContainer}>
            <TextInputComp
              label="Full Name"
              placeholder="e.g. Rachna Sharma"
              value={fullName}
              onChangeText={(text: string) => setFullName(text)}
              autoCapitalize="words"
            />

            <TextInputComp
              label="Mobile Number"
              placeholder="e.g. 98765 43210"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text: string) => setPhoneNumber(text)}
              maxLength={14}
            />

            <ButtonComp
              title={isLoading ? "Sending OTP..." : "Get OTP"}
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.submitBtn}
            />

            {/* Bottom link to Login */}
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(NavigationStrings.LOGIN)}
              >
                <Text style={styles.loginLink}>Sign In</Text>
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
  formContainer: {
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(10),
  },
  submitBtn: {
    marginTop: moderateScaleVertical(14),
    backgroundColor: colors.primaryBlue,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: moderateScaleVertical(24),
  },
  loginPrompt: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  loginLink: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.primaryBlue,
  },
});

export default Register;
