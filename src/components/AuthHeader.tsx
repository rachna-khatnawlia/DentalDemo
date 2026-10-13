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
    <View style={{ paddingHorizontal: moderateScale(20), paddingTop: moderateScale(10), paddingBottom: moderateScale(15) }}>
      {showBack && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
      <Image source={imagepath.dentacareLogo} style={styles.logoStyle} />
      <Text style={[commonstyle.bold20, { color: colors.textPrimary, textAlign: "center", marginTop: moderateScale(8) }]}>
        {title}
      </Text>
      <Text style={[commonstyle.medium13, { color: colors.textSecondary, textAlign: "center", marginTop: moderateScale(6), lineHeight: 20 }]}>
        {des}
      </Text>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: colors.backBtnBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(6),
  },
  logoStyle: {
    height: moderateScale(85),
    width: moderateScale(85),
    resizeMode: "contain",
    borderRadius: moderateScale(16),
    alignSelf: 'center'
  },
});

//make this component available to the app
export default AuthHeader;

