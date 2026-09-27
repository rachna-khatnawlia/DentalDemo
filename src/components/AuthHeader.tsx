//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { moderateScale, width } from "../styles/responsiveSize";
import imagepath from "../constants/imagepath";
import commonstyle from "../styles/commonstyles";

// create a component
interface headerInterface {
  title: string;
  des: string;
}
const AuthHeader = ({ title, des }: headerInterface) => {
  return (
    <View style={{ padding: moderateScale(15) }}>
      <Image source={imagepath.logo} style={styles.logoStyle} />
      <Text style={commonstyle.bold18}>{title}</Text>
      <Text style={commonstyle.medium14}>{des}</Text>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  logoStyle: {
    height: width / 3,
    width: width / 3,
    resizeMode: "contain",
    borderRadius: moderateScale(12),
    marginTop: moderateScale(30),
    marginBottom: moderateScale(10),
    alignSelf:'center'
  },
});

//make this component available to the app
export default AuthHeader;
