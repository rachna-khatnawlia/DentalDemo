//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import AuthWrapperContainer from "../../components/AuthWrapperContainer";
import TextInputComp from "../../components/TextInputComp";
import { moderateScale } from "../../styles/responsiveSize";
import ButtonComp from "../../components/ButtonComp";
import AuthHeader from "../../components/AuthHeader";
import colors from "../../constants/colors";

import { useDispatch } from "react-redux";
import { onLogin } from "../../redux/slice/authSlice";

// create a component
const Login = () => {
  const dispatch = useDispatch();

  const handleLogin = () => {
    dispatch(onLogin("demo-access-token-123"));
  };

  return (
    <AuthWrapperContainer>
      <AuthHeader title="Dental Proposal Demo" des="Explore International Clinics & Treatments" />
      <View style={{ padding: moderateScale(20), gap: moderateScale(14) }}>
        <TextInputComp label="Email" placeholder="doctor@clinicdemo.com" />
        <TextInputComp label="Password" placeholder="••••••••" />

        <ButtonComp title="Sign In" onPress={handleLogin} />

        <ButtonComp
          title="⚡ Quick Demo Access"
          onPress={handleLogin}
          style={{
            backgroundColor: colors.primaryCyan,
            marginTop: moderateScale(8),
          }}
          textStyle={{ color: colors.primaryNavy }}
        />
      </View>
    </AuthWrapperContainer>
  );
};

// define your styles
const styles = StyleSheet.create({});

//make this component available to the app
export default Login;
