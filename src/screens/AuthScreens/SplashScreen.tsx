import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    // Smooth fade & scale in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 2.4s
    const timer = setTimeout(() => {
      handleDismiss();
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onFinish?.();
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="dark" />

      {/* Decorative Background Curved Shapes matching reference mockup */}
      <View style={styles.bgBlobTopLeft} />
      <View style={styles.bgBlobRight} />

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDismiss}
        style={styles.touchableArea}
      >
        {/* Top & Middle Section: Logo, Title, Subtitle */}
        <Animated.View
          style={[
            styles.brandSection,
            {
              paddingTop: insets.top + moderateScaleVertical(45),
              transform: [{ scale: scaleAnim }],
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

        {/* Bottom Section: Smiling Patient with Dentist hands & Instruments */}
        <View style={styles.patientSection}>
          <Image
            source={imagepath.splashPatient}
            style={styles.patientImage}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#F5F8FD",
    zIndex: 9999,
  },
  touchableArea: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Soft organic decorative curves in background
  bgBlobTopLeft: {
    position: "absolute",
    top: -moderateScale(60),
    left: -moderateScale(60),
    width: moderateScale(260),
    height: moderateScale(260),
    borderRadius: moderateScale(130),
    backgroundColor: "#EAF4FE",
    opacity: 0.9,
  },
  bgBlobRight: {
    position: "absolute",
    top: moderateScaleVertical(70),
    right: -moderateScale(80),
    width: moderateScale(200),
    height: moderateScale(200),
    borderRadius: moderateScale(100),
    backgroundColor: "#EEF6FF",
    opacity: 0.8,
  },

  // Branding Section
  brandSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: moderateScale(20),
  },
  logoImage: {
    width: moderateScale(110),
    height: moderateScale(110),
    marginBottom: moderateScaleVertical(14),
  },
  brandTitle: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(36),
    color: "#0F1E36",
    letterSpacing: -0.6,
  },
  brandTitleAccent: {
    color: colors.primaryBlue,
  },
  tagline: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(16),
    color: "#475569",
    marginTop: moderateScaleVertical(8),
    textAlign: "center",
  },
  taglineSub: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(16),
    color: "#475569",
    marginTop: moderateScaleVertical(2),
    textAlign: "center",
  },

  // Bottom Patient Photo Section
  patientSection: {
    width: "100%",
    height: "46%",
    position: "relative",
    justifyContent: "flex-end",
  },
  patientImage: {
    width: "100%",
    height: "100%",
  },
});

export default SplashScreen;
