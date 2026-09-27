import { StyleSheet } from "react-native";
import { moderateScale, textScale, width } from "./responsiveSize";
import fontFamily from "../constants/fontFamily";
import colors from "../constants/colors";

const commonstyle = StyleSheet.create({


  bold12: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
    color: colors.black,
  },
  bold14: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
    color: colors.black,
  },
  bold16: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
    color: colors.black,
  },
  bold18: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    color: colors.black,
  },
  bold20: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(20),
    color: colors.black,
  },

  semibold12: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.black,
  },
  semibold14: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(14),
    color: colors.black,
  },
  semibold16: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(16),
    color: colors.black,
  },
  semibold18: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(18),
    color: colors.black,
  },
  semibold20: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(20),
    color: colors.black,
  },

  medium12: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: colors.black,
  },
  medium13: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(13),
    color: colors.black,
  },
  medium14: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(14),
    color: colors.black,
  },
  medium16: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(16),
    color: colors.black,
  },
  medium18: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(18),
    color: colors.black,
  },
  medium20: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(20),
    color: colors.black,
  },
});

export default commonstyle;
