import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import imagepath from "../../constants/imagepath";
import NavigationStrings from "../../navigation/NavigationStrings";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
  width,
} from "../../styles/responsiveSize";

interface IntroScreenProps {
  navigation: any;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  // Floating tooth animation
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Slider animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [sliderWidth, setSliderWidth] = useState(0);
  const isNavigating = useRef(false);

  const KNOB_SIZE = moderateScale(48);
  const PADDING = moderateScale(5);
  const maxSlide = Math.max(0, sliderWidth - KNOB_SIZE - PADDING * 2);

  useEffect(() => {
    // Gentle floating loop for 3D tooth
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    floatLoop.start();

    return () => floatLoop.stop();
  }, [floatAnim]);

  const handleGetStarted = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    // Smooth completion animation
    Animated.timing(slideAnim, {
      toValue: maxSlide > 0 ? maxSlide : 200,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate(NavigationStrings.LOGIN);
      // Reset after a delay so if user comes back, button is reset
      setTimeout(() => {
        isNavigating.current = false;
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }, 600);
    });
  };

  // Pan Responder for sliding action
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 4,
      onPanResponderMove: (_, gesture) => {
        if (isNavigating.current) return;
        const bounded = Math.max(0, Math.min(gesture.dx, maxSlide));
        slideAnim.setValue(bounded);
      },
      onPanResponderRelease: (_, gesture) => {
        if (isNavigating.current) return;
        if (gesture.dx > maxSlide * 0.45) {
          handleGetStarted();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const onSliderLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setSliderWidth(w);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top 3D Tooth Artwork with Radiant Backdrop */}
      <View style={[styles.heroContainer]}>
        <Animated.View
          style={[
            styles.toothImageWrapper,
            {
              transform: [{ translateY: floatAnim }],
            },
          ]}
        >
          <Image
            source={imagepath.introTooth}
            style={styles.toothImage}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      {/* Bottom Sheet Card */}
      <View
        style={{
          ...styles.cardContainer,
          paddingBottom: Math.max(insets.bottom, moderateScaleVertical(50)),
        }}
      >
        {/* Floating Center Badge with Dental Implant Icon */}
        <Image
          source={imagepath.implantIcon}
          style={styles.badgeImage}
          resizeMode="contain"
        />

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>Connect With Trusted</Text>
          <Text style={styles.title}>Doctors Instantly</Text>

          <Text style={styles.subtitle}>
            Offers range of life plans and policies to help you protect you your
            family
          </Text>
        </View>

        {/* Action Slider Pill Button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={handleGetStarted}
            onLayout={onSliderLayout}
            style={styles.sliderTrack}
          >
            {/* "Get Started" Label */}
            <View style={styles.sliderLabelContainer}>
              <Text style={styles.sliderLabel}>Get Started</Text>
            </View>

            {/* Circular Slider Knob with Triple Chevron */}
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.sliderKnob,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <View style={styles.knobInner}>
                <View style={styles.chevronRow}>
                  <Ionicons
                    name="chevron-forward"
                    size={moderateScale(15)}
                    color={colors.white}
                    style={{ marginRight: -moderateScale(6) }}
                  />
                  <Ionicons
                    name="chevron-forward"
                    size={moderateScale(15)}
                    color={colors.white}
                    style={{ opacity: 0.85, marginRight: -moderateScale(6) }}
                  />
                  <Ionicons
                    name="chevron-forward"
                    size={moderateScale(15)}
                    color={colors.white}
                    style={{ opacity: 0.6 }}
                  />
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#169BAA",
  },
  heroContainer: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  toothImageWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  toothImage: {
    width: "100%",
    height: "100%",
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(34),
    borderTopRightRadius: moderateScale(34),
    paddingHorizontal: moderateScale(24),
    justifyContent: "space-between",
    shadowColor: "#002B36",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 12,
  },
  badgeImage: {
    marginTop: moderateScale(-28),
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(10),
    shadowColor: "#0A192F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
    alignSelf: "center",
  },
  contentSection: {
    alignItems: "center",
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(22),
    color: "#0F1E36",
    textAlign: "center",
    lineHeight: textScale(28),
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: "#64748B",
    textAlign: "center",
    lineHeight: textScale(18),
    marginTop: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(14),
  },
  buttonWrapper: {
    width: "100%",
  },
  sliderTrack: {
    width: "100%",
    height: moderateScale(58),
    borderRadius: moderateScale(29),
    backgroundColor: "#00B4D8",
    overflow: "hidden",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#00B4D8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  sliderLabelContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderLabel: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
    color: colors.white,
    letterSpacing: 0.3,
  },
  sliderKnob: {
    position: "absolute",
    left: moderateScale(5),
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  knobInner: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(24),
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  chevronRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signInRow: {
    marginTop: moderateScaleVertical(14),
    paddingVertical: moderateScaleVertical(4),
  },
  signInPrompt: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: "#94A3B8",
  },
  signInLink: {
    fontFamily: fontFamily.semiBold,
    color: colors.accentBlue,
  },
});

export default IntroScreen;
