//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { moderateScale, moderateScaleVertical, textScale } from "../styles/responsiveSize";
import colors from "../constants/colors";
import fontFamily from "../constants/fontFamily";

interface ButtonCompProps {
  title?: string;
  onPress?: () => void;
  style?: any;
  textStyle?: any;
}

// create a component
const ButtonComp: React.FC<ButtonCompProps> = ({
  title = "",
  onPress,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateScaleVertical(15),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(28),
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  text: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(15),
    letterSpacing: 0.2,
  },
});

//make this component available to the app
export default ButtonComp;

