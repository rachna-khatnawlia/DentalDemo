import React, { Component } from "react";
import { View, Text, StyleSheet, TextInput, TextInputProps } from "react-native";
import { moderateScale } from "../styles/responsiveSize";
import colors from "../constants/colors";
import commonstyle from "../styles/commonstyles";

interface TextInputCompProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  inputStyle?: any;
}

// create a component
const TextInputComp: React.FC<TextInputCompProps> = ({
  label = "",
  placeholder = "",
  inputStyle = {},
  ...rest
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.labelStyle}>{label}</Text> : null}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.inputStyle, inputStyle]}
        {...rest}
      />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(16),
  },
  labelStyle: {
    ...commonstyle.semibold12,
    color: colors.textPrimary,
    marginBottom: moderateScale(4),
  },
  inputStyle: {
    ...commonstyle.medium14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(13),
    color: colors.textPrimary,
  },
});

//make this component available to the app
export default TextInputComp;

