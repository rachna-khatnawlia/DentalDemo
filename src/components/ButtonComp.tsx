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
    backgroundColor: colors.primaryNavy,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateScaleVertical(14),
    borderRadius: moderateScale(10),
    shadowColor: colors.primaryNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(14),
  },
});

//make this component available to the app
export default ButtonComp;
