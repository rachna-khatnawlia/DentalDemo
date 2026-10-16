import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import colors from "../constants/colors";
import fontFamily from "../constants/fontFamily";
import { moderateScale, moderateScaleVertical, textScale } from "../styles/responsiveSize";

interface CustomToastProps {
  text1?: string;
  text2?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  bgColor: string;
  iconBgColor: string;
}

const CustomToastCard: React.FC<CustomToastProps> = ({
  text1,
  text2,
  iconName,
  accentColor,
  iconBgColor,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => Toast.hide()}
      style={[styles.container, { borderLeftColor: accentColor }]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={iconName} size={moderateScale(20)} color={accentColor} />
      </View>
      <View style={styles.textContainer}>
        {Boolean(text1) && (
          <Text style={styles.titleText} numberOfLines={2}>
            {text1}
          </Text>
        )}
        {Boolean(text2) && (
          <Text style={styles.messageText} numberOfLines={4}>
            {text2}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <CustomToastCard
      text1={text1}
      text2={text2}
      iconName="checkmark-circle"
      accentColor="#10B981"
      bgColor="#FFFFFF"
      iconBgColor="#ECFDF5"
    />
  ),
  error: ({ text1, text2 }: any) => (
    <CustomToastCard
      text1={text1}
      text2={text2}
      iconName="alert-circle"
      accentColor="#EF4444"
      bgColor="#FFFFFF"
      iconBgColor="#FEF2F2"
    />
  ),
  warning: ({ text1, text2 }: any) => (
    <CustomToastCard
      text1={text1}
      text2={text2}
      iconName="warning"
      accentColor="#F59E0B"
      bgColor="#FFFFFF"
      iconBgColor="#FFFBEB"
    />
  ),
  info: ({ text1, text2 }: any) => (
    <CustomToastCard
      text1={text1}
      text2={text2}
      iconName="information-circle"
      accentColor={colors.primaryBlue}
      bgColor="#FFFFFF"
      iconBgColor="#EFF6FF"
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: moderateScale(14),
    borderLeftWidth: moderateScale(5),
    paddingVertical: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(14),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    alignSelf: "center",
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    marginRight: moderateScale(12),
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleText: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(13.5),
    color: colors.textPrimary,
    marginBottom: moderateScaleVertical(2),
  },
  messageText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: colors.textSecondary,
    lineHeight: textScale(16),
  },
});

export default toastConfig;
