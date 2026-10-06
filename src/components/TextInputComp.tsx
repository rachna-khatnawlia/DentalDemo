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
    marginBottom: moderateScale(15),
  },
  labelStyle: {
    ...commonstyle.semibold12,
    color: colors.textPrimary,
  },
  inputStyle: {
    ...commonstyle.medium14,
    backgroundColor: colors.bgLight,
    borderWidth: moderateScale(1),
    borderColor: colors.borderLight,
    borderRadius: moderateScale(8),
    marginTop: moderateScale(6),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    color: colors.textPrimary,
  },
  
});

//make this component available to the app
export default TextInputComp;
