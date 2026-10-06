import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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

const Register = ({ navigation }: any) => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleRegister = () => {
    // Navigate to OTP verification passing mobile registration context
    navigation.navigate(NavigationStrings.VERIFY_OTP, {
      flow: "register",
      phoneNumber: phoneNumber.trim() || "+1 (555) 000-0000",
      fullName: fullName.trim() || "User",
    });
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
            des="Sign up with your mobile number to explore international dental proposals"
            showBack={true}
            onBack={() => navigation.goBack()}
          />

          <View style={styles.formContainer}>
            <TextInputComp
              label="Full Name"
              placeholder="e.g. Sarah Jenkins"
              value={fullName}
              onChangeText={setFullName}
            />

            <TextInputComp
              label="Mobile Number"
              placeholder="Enter Mobile Number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <ButtonComp
              title="Get OTP"
              onPress={handleRegister}
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
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(10),
  },
  submitBtn: {
    marginTop: moderateScaleVertical(12),
    backgroundColor: colors.primaryNavy,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: moderateScaleVertical(20),
  },
  loginPrompt: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  loginLink: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.primaryCyan,
  },
});

export default Register;
