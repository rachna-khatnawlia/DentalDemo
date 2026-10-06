import React, { Component } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { moderateScale, width } from "../styles/responsiveSize";
import imagepath from "../constants/imagepath";
import commonstyle from "../styles/commonstyles";
import colors from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

// create a component
interface headerInterface {
  title: string;
  des: string;
  showBack?: boolean;
  onBack?: () => void;
}
const AuthHeader = ({ title, des, showBack = false, onBack }: headerInterface) => {
  return (
    <View style={{ padding: moderateScale(15) }}>
      {showBack && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primaryNavy} />
        </TouchableOpacity>
      )}
      <Image source={imagepath.logo} style={styles.logoStyle} />
      <Text style={commonstyle.bold18}>{title}</Text>
      <Text style={commonstyle.medium14}>{des}</Text>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(10),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(10),
  },
  logoStyle: {
    height: width / 3,
    width: width / 3,
    resizeMode: "contain",
    borderRadius: moderateScale(12),
    marginTop: moderateScale(10),
    marginBottom: moderateScale(10),
    alignSelf: 'center'
  },
});

//make this component available to the app
export default AuthHeader;
