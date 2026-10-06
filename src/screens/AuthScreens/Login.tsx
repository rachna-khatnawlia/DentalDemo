import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

import { useDispatch } from "react-redux";
import { onLogin } from "../../redux/slice/authSlice";

// create a component
const Login = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleGetOtp = () => {
    navigation.navigate(NavigationStrings.VERIFY_OTP, {
      flow: "login",
      phoneNumber: phoneNumber.trim() || "+1 (555) 000-0000",
    });
  };

  const handleQuickDemo = () => {
    dispatch(onLogin("demo-access-token-123"));
  };

  return (
    <AuthWrapperContainer>
      <AuthHeader
        title="Dental Proposal Demo"
        des="Explore International Clinics & Treatments"
      />
      <View style={styles.formContainer}>
        <TextInputComp
          label="Mobile Number"
          placeholder="Enter Mobile Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Primary Get OTP Button */}
        <ButtonComp
          title="Get OTP"
          onPress={handleGetOtp}
          style={styles.getOtpBtn}
        />

        {/* Quick Demo Access Button */}
        <ButtonComp
          title="⚡ Quick Demo Access"
          onPress={handleQuickDemo}
          style={styles.demoBtn}
          textStyle={{ color: colors.primaryNavy }}
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

// define your styles
const styles = StyleSheet.create({
  formContainer: {
    padding: moderateScale(20),
  },
  getOtpBtn: {
    backgroundColor: colors.primaryNavy,
    marginTop: moderateScaleVertical(8),
  },
  demoBtn: {
    backgroundColor: colors.primaryCyan,
    marginTop: moderateScaleVertical(12),
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: moderateScaleVertical(22),
  },
  registerPrompt: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  registerLink: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.primaryCyan,
  },
});

export default Login;
