//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { moderateScale } from "../styles/responsiveSize";
import colors from "../constants/colors";
import commonstyle from "../styles/commonstyles";

// create a component
const TextInputComp = ({ label = "", placeholder = "", inputStyle = {} }) => {
  return (
    <View style={styles.container}>
      <Text style={commonstyle.semibold12}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        style={{ ...styles.inputStyle, ...inputStyle }}
      />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(15),
  },
  inputStyle: {
    backgroundColor: colors.grey_ee,
    borderWidth: moderateScale(1),
    borderColor: colors.grey_cc,
    borderRadius: moderateScale(4),
    marginTop: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    ...commonstyle.medium12
  },
  
});

//make this component available to the app
export default TextInputComp;
