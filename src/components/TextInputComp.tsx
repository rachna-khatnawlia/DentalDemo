import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../styles/responsiveSize";
import colors from "../constants/colors";
import fontFamily from "../constants/fontFamily";

export interface TextInputCompProps extends TextInputProps {
  label?: string;
  required?: boolean;
  badge?: React.ReactNode;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  leftIconSize?: number;
  leftIconComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightIconColor?: string;
  rightIconSize?: number;
  rightIconComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onRightIconPress?: () => void;
  showClearButton?: boolean;
  onClear?: () => void;
  error?: string;
}

const TextInputComp: React.FC<TextInputCompProps> = ({
  label = "",
  required = false,
  badge,
  placeholder = "",
  containerStyle,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  leftIconColor = colors.textSecondary,
  leftIconSize = moderateScale(17),
  leftIconComponent,
  leftComponent,
  rightIcon,
  rightIconColor = colors.textSecondary,
  rightIconSize = moderateScale(18),
  rightIconComponent,
  rightComponent,
  onRightIconPress,
  showClearButton = false,
  onClear,
  error,
  value,
  ...rest
}) => {
  const hasValue = Boolean(value && value.length > 0);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label and Badge Row */}
      {label || badge ? (
        <View style={styles.labelRow}>
          {label ? (
            <Text
              style={[styles.labelStyle, labelStyle]}
              numberOfLines={1}
            >
              {label}
              {required ? <Text style={styles.requiredStar}> *</Text> : null}
            </Text>
          ) : <View style={{ flex: 1 }} />}
          {badge ? <View style={styles.badgeWrapper}>{badge}</View> : null}
        </View>
      ) : null}

      {/* Input Container Box */}
      <View style={[styles.inputContainer, inputContainerStyle]}>
        {/* Left Component or Icon */}
        {leftComponent ? (
          leftComponent
        ) : leftIconComponent ? (
          leftIconComponent
        ) : leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={leftIconSize}
            color={leftIconColor}
            style={styles.leftIcon}
          />
        ) : null}

        {/* Text Input Field */}
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={[styles.inputStyle, inputStyle]}
          {...rest}
        />

        {/* Clear Button */}
        {showClearButton && hasValue && onClear ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClear}
            style={styles.rightBtn}
          >
            <Ionicons
              name="close-circle"
              size={moderateScale(16)}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}

        {/* Right Component or Icon */}
        {rightComponent ? (
          rightComponent
        ) : rightIconComponent ? (
          rightIconComponent
        ) : rightIcon ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightBtn}
          >
            <Ionicons
              name={rightIcon}
              size={rightIconSize}
              color={rightIconColor}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScaleVertical(14),
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(6),
    gap: moderateScale(8),
  },
  labelStyle: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
    color: colors.textPrimary,
    flexShrink: 1,
  },
  badgeWrapper: {
    flexShrink: 0,
    alignItems: "flex-end",
  },
  requiredStar: {
    color: "#EF4444",
    fontFamily: fontFamily.bold,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    minHeight: moderateScale(46),
  },
  inputStyle: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: textScale(14),
    color: colors.textPrimary,
    paddingVertical: moderateScaleVertical(10),
  },
  leftIcon: {
    marginRight: moderateScale(8),
  },
  rightBtn: {
    padding: moderateScale(4),
    marginLeft: moderateScale(4),
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    color: "#EF4444",
    marginTop: moderateScaleVertical(4),
  },
});

export default TextInputComp;
