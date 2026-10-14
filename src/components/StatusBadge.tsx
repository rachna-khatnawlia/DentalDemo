import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import fontFamily from "../constants/fontFamily";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../styles/responsiveSize";

export type StatusBadgeVariant =
  | "success"
  | "warning"
  | "info"
  | "error"
  | "neutral"
  | "purple";

export interface StatusBadgeProps {
  label?: string;
  variant?: StatusBadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap | null;
  customIcon?: React.ReactNode;
  showIcon?: boolean;
  iconSize?: number;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  size?: "small" | "medium";
}

const VARIANT_CONFIG: Record<
  StatusBadgeVariant,
  {
    bg: string;
    text: string;
    defaultIcon: keyof typeof Ionicons.glyphMap;
  }
> = {
  success: {
    bg: "#DCFCE7",
    text: "#16A34A",
    defaultIcon: "checkmark-circle",
  },
  warning: {
    bg: "#FEF3C7",
    text: "#D97706",
    defaultIcon: "alert-circle",
  },
  info: {
    bg: "#EFF6FF",
    text: "#0066F6",
    defaultIcon: "shield-checkmark",
  },
  error: {
    bg: "#FEE2E2",
    text: "#DC2626",
    defaultIcon: "close-circle",
  },
  neutral: {
    bg: "#F1F5F9",
    text: "#475569",
    defaultIcon: "information-circle",
  },
  purple: {
    bg: "#F3E8FF",
    text: "#9333EA",
    defaultIcon: "sparkles",
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = "success",
  icon,
  customIcon,
  showIcon = true,
  iconSize,
  iconColor,
  backgroundColor,
  textColor,
  containerStyle,
  textStyle,
  onPress,
  size = "small",
}) => {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.success;
  const bg = backgroundColor || config.bg;
  const fg = textColor || config.text;
  const resolvedIcon = icon !== undefined ? icon : config.defaultIcon;
  const resolvedIconSize =
    iconSize || (size === "medium" ? moderateScale(14) : moderateScale(12));

  const content = (
    <View
      style={[
        styles.baseBadge,
        size === "medium" ? styles.mediumBadge : styles.smallBadge,
        { backgroundColor: bg },
        containerStyle,
      ]}
    >
      {showIcon && (
        customIcon ? (
          customIcon
        ) : resolvedIcon ? (
          <Ionicons
            name={resolvedIcon}
            size={resolvedIconSize}
            color={iconColor || fg}
          />
        ) : null
      )}
      {label ? (
        <Text
          numberOfLines={1}
          style={[
            styles.baseText,
            size === "medium" ? styles.mediumText : styles.smallText,
            { color: fg },
            textStyle,
          ]}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  baseBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: moderateScale(6),
    flexShrink: 0,
    maxWidth: "100%",
  },
  smallBadge: {
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScaleVertical(2.5),
  },
  mediumBadge: {
    gap: moderateScale(6),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(4.5),
    borderRadius: moderateScale(8),
  },
  baseText: {
    fontFamily: fontFamily.semiBold,
    flexShrink: 1,
  },
  smallText: {
    fontSize: textScale(10.5),
  },
  mediumText: {
    fontSize: textScale(12),
  },
});

export default StatusBadge;
