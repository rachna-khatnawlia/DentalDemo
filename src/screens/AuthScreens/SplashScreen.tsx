import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import imagepath from "../../constants/imagepath";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";

interface SplashScreenProps {
  onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const brandScaleAnim = useRef(new Animated.Value(0.96)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(brandScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.bezier(0.3, 0.1, 0.3, 1),
        useNativeDriver: false,
      }),
    ]).start();

    // Auto dismiss after 2.6s
    const timer = setTimeout(() => {
      handleDismiss();
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      onFinish?.();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["25%", "100%"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="dark" />

      {/* Seamless full-screen 3D dental podium artwork background */}
      <Image
        source={imagepath.splashFullSeamless}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDismiss}
        style={styles.touchableArea}
      >
        {/* Top Brand Header: Logo, DentaCare & Subtitle */}
        <Animated.View
          style={[
            styles.brandSection,
            {
              paddingTop: insets.top + moderateScaleVertical(18),
              transform: [{ scale: brandScaleAnim }],
            },
          ]}
        >
          <Image
            source={imagepath.dentacareLogo}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>
            Denta<Text style={styles.brandTitleAccent}>Care</Text>
          </Text>
          <Text style={styles.tagline}>Healthy Smiles</Text>
          <Text style={styles.taglineSub}>Brighter Tomorrows</Text>
        </Animated.View>

        {/* Center breathing space so the 3D tooth podium shines through */}
        <View style={styles.centerSpacer} />

        {/* Bottom Section: Animated Loading Pill & Companion Subtitle */}
        <View
          style={[
            styles.bottomSection,
            { paddingBottom: insets.bottom + moderateScaleVertical(22) },
          ]}
        >
          {/* Progress Bar Indicator Track */}
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[styles.progressBarFill, { width: progressWidth }]}
            />
          </View>

          {/* Slogan */}
          <Text style={styles.companionText}>
            Your trusted dental care companion
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D6ECF9",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  touchableArea: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Top Branding Section
  brandSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(20),
    zIndex: 2,
  },
  logoImage: {
    width: moderateScale(78),
    height: moderateScale(78),
    marginBottom: moderateScaleVertical(8),
  },
  brandTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(32),
    color: "#0F1E36",
    letterSpacing: -0.6,
  },
  brandTitleAccent: {
    color: colors.primaryBlue,
  },
  tagline: {
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(16),
    color: "#334155",
    marginTop: moderateScaleVertical(6),
    textAlign: "center",
  },
  taglineSub: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(15),
    color: "#475569",
    marginTop: moderateScaleVertical(2),
    textAlign: "center",
  },

  // Center breathing area
  centerSpacer: {
    flex: 1,
  },

  // Bottom Footer Section
  bottomSection: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: moderateScale(24),
    zIndex: 2,
  },
  progressBarTrack: {
    width: moderateScale(76),
    height: moderateScaleVertical(4),
    borderRadius: moderateScale(2),
    backgroundColor: "#BCE0F8",
    overflow: "hidden",
    marginBottom: moderateScaleVertical(14),
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(2),
  },
  companionText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12.5),
    color: "#47617D",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

export default SplashScreen;
