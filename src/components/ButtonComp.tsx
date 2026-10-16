import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { moderateScale, moderateScaleVertical, textScale } from "../styles/responsiveSize";
import colors from "../constants/colors";
import fontFamily from "../constants/fontFamily";

interface ButtonCompProps {
  title?: string;
  onPress?: () => void;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
  isLoading?: boolean;
}

const ButtonComp: React.FC<ButtonCompProps> = ({
  title = "",
  onPress,
  style,
  textStyle,
  disabled = false,
  isLoading = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.container,
        (disabled || isLoading) && styles.disabledContainer,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

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
  disabledContainer: {
    opacity: 0.65,
  },
  text: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(15),
    letterSpacing: 0.2,
  },
});

export default ButtonComp;
