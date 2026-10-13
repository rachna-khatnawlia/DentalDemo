import React, { useEffect, useRef, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setIntroShown } from "../../redux/slice/authSlice";
import colors from "../../constants/colors";
import fontFamily from "../../constants/fontFamily";
import imagepath from "../../constants/imagepath";
import NavigationStrings from "../../navigation/NavigationStrings";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../styles/responsiveSize";

const { width } = Dimensions.get("window");

interface IntroScreenProps {
  navigation: any;
}

const ONBOARDING_SLIDES = [
  {
    id: "1",
    titlePart1: "Your Smile",
    titlePart2: "Our Priority",
    subtitle:
      "Book appointments, find expert dentists and get the best dental care near you.",
    image: imagepath.toothCharacter,
  },
  {
    id: "2",
    titlePart1: "Expert Dentists",
    titlePart2: "Near You",
    subtitle:
      "Connect with certified orthodontists and dental surgeons verified by thousands of reviews.",
    image: imagepath.dentistRohan,
  },
  {
    id: "3",
    titlePart1: "Seamless Booking",
    titlePart2: "Zero Wait Time",
    subtitle:
      "Pick your favorite time slot, choose treatment options, and get instant appointment confirmation.",
    image: imagepath.toothCharacter,
  },
  {
    id: "4",
    titlePart1: "Comprehensive",
    titlePart2: "Dental Care",
    subtitle:
      "From routine cleanings to clear aligners and implants, your oral health journey starts here.",
    image: imagepath.splashPatient,
  },
];

const IntroScreen: React.FC<IntroScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [activeSlide, setActiveSlide] = useState(0);
  const [showSplash, setShowSplash] = useState(false);

  // Animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const splashFade = useRef(new Animated.Value(1)).current;

  // Splash screen transition timer
  useEffect(() => {
    const timer = setTimeout(() => {
      dismissSplash();
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  const dismissSplash = async () => {
    Animated.timing(splashFade, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(async () => {
      setShowSplash(false);
      try {
        const value = await AsyncStorage.getItem("isIntroShown");
        if (value === "true") {
          navigation.replace(NavigationStrings.LOGIN);
        }
      } catch (e) {
        console.log("Error checking isIntroShown in dismissSplash", e);
      }
    });
  };

  // Floating tooth animation loop
  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatAnim]);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("isIntroShown", "true");
    } catch (e) {
      console.log("Error saving isIntroShown to storage", e);
    }
    dispatch(setIntroShown(true));
    navigation.replace(NavigationStrings.LOGIN);
  };

  const handleNextSlide = () => {
    if (activeSlide < ONBOARDING_SLIDES.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setActiveSlide((prev) => prev + 1);
    } else {
      handleFinishOnboarding();
    }
  };

  const currentSlide = ONBOARDING_SLIDES[activeSlide];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Screen 1: Splash Screen Overlay */}
      {showSplash && (
        <Animated.View
          style={[
            styles.splashContainer,
            { opacity: splashFade },
          ]}
        >
          {/* Decorative Background Curved Shapes matching reference */}
          <View style={styles.splashBgBlobTopLeft} />
          <View style={styles.splashBgBlobRight} />

          <TouchableOpacity
            activeOpacity={1}
            onPress={dismissSplash}
            style={styles.splashTouchArea}
          >
            <View
              style={[
                styles.splashTopSection,
                { paddingTop: insets.top + moderateScaleVertical(40) },
              ]}
            >
              <Image
                source={imagepath.dentacareLogo}
                style={styles.splashLogo}
                resizeMode="contain"
              />
              <Text style={styles.splashBrandName}>
                Denta<Text style={styles.splashBrandNameAccent}>Care</Text>
              </Text>
              <Text style={styles.splashTagline}>Healthy Smiles</Text>
              <Text style={styles.splashTaglineSub}>Brighter Tomorrows</Text>
            </View>

            <View style={styles.splashBottomSection}>
              <Image
                source={imagepath.splashPatient}
                style={styles.splashPatientImage}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Screen 2: Onboarding Screen */}
      <View
        style={[
          styles.onboardingContent,
          {
            paddingTop: insets.top + moderateScaleVertical(10),
            paddingBottom: Math.max(insets.bottom, moderateScaleVertical(24)),
          },
        ]}
      >
        {/* Top Header Row with Skip Button */}
        <View style={styles.topHeader}>
          <View style={{ width: moderateScale(50) }} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleFinishOnboarding}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Central Hero Character with Floating Motion */}
        <View style={styles.heroWrapper}>
          <Animated.View
            style={[
              styles.characterWrapper,
              {
                transform: [{ translateY: floatAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <Image
              source={currentSlide.image}
              style={styles.heroToothImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Text Section */}
        <Animated.View style={[styles.textSection, { opacity: fadeAnim }]}>
          <Text style={styles.mainTitlePart1}>{currentSlide.titlePart1}</Text>
          <Text style={styles.mainTitlePart2}>{currentSlide.titlePart2}</Text>
          <Text style={styles.subtitleText}>{currentSlide.subtitle}</Text>
        </Animated.View>

        {/* Pagination Dots (4 dots matching the mockup) */}
        <View style={styles.dotsRow}>
          {ONBOARDING_SLIDES.map((_, idx) => {
            const isActive = idx === activeSlide;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveSlide(idx)}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Bottom Action Area */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleNextSlide}
            style={styles.getStartedButton}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons
              name="arrow-forward"
              size={moderateScale(18)}
              color={colors.white}
              style={{ marginLeft: moderateScale(8) }}
            />
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.alreadyAccountText}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleFinishOnboarding}
            >
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Splash Screen Styles (Screen 1)
  splashContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#F5F8FD",
    zIndex: 100,
    justifyContent: "space-between",
  },
  splashBgBlobTopLeft: {
    position: "absolute",
    top: -moderateScale(50),
    left: -moderateScale(50),
    width: moderateScale(220),
    height: moderateScale(220),
    borderRadius: moderateScale(110),
    backgroundColor: "#EAF4FE",
    opacity: 0.9,
  },
  splashBgBlobRight: {
    position: "absolute",
    top: moderateScaleVertical(80),
    right: -moderateScale(60),
    width: moderateScale(170),
    height: moderateScale(170),
    borderRadius: moderateScale(85),
    backgroundColor: "#EDF6FF",
    opacity: 0.75,
  },
  splashTouchArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  splashTopSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  splashLogo: {
    width: moderateScale(110),
    height: moderateScale(110),
    marginBottom: moderateScaleVertical(14),
  },
  splashBrandName: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(34),
    color: "#0F1E36",
    letterSpacing: -0.6,
  },
  splashBrandNameAccent: {
    color: colors.primaryBlue,
  },
  splashTagline: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(15),
    color: "#475569",
    marginTop: moderateScaleVertical(8),
    textAlign: "center",
  },
  splashTaglineSub: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(15),
    color: "#475569",
    marginTop: moderateScaleVertical(2),
    textAlign: "center",
  },
  splashBottomSection: {
    width: "100%",
    height: "46%",
    position: "relative",
    justifyContent: "flex-end",
  },
  splashPatientImage: {
    width: "100%",
    height: "100%",
  },

  // Onboarding Styles (Screen 2)
  onboardingContent: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
    justifyContent: "space-between",
    backgroundColor: colors.white,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  skipButton: {
    paddingVertical: moderateScaleVertical(6),
    paddingHorizontal: moderateScale(12),
  },
  skipText: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(14),
    color: colors.textMuted,
  },
  heroWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxHeight: moderateScaleVertical(310),
  },
  characterWrapper: {
    width: width * 0.72,
    height: width * 0.72,
    justifyContent: "center",
    alignItems: "center",
  },
  heroToothImage: {
    width: "100%",
    height: "100%",
  },
  textSection: {
    alignItems: "center",
    paddingHorizontal: moderateScale(10),
    marginTop: moderateScaleVertical(10),
  },
  mainTitlePart1: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(28),
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: textScale(34),
  },
  mainTitlePart2: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(28),
    color: colors.primaryBlue,
    textAlign: "center",
    lineHeight: textScale(34),
    marginTop: moderateScaleVertical(2),
  },
  subtitleText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: textScale(20),
    marginTop: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(12),
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: moderateScaleVertical(20),
    gap: moderateScale(6),
  },
  dot: {
    height: moderateScale(6),
    borderRadius: moderateScale(3),
  },
  dotActive: {
    width: moderateScale(22),
    backgroundColor: colors.primaryBlue,
  },
  dotInactive: {
    width: moderateScale(6),
    backgroundColor: colors.borderLight,
  },
  bottomActions: {
    width: "100%",
    alignItems: "center",
  },
  getStartedButton: {
    width: "100%",
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(28),
    paddingVertical: moderateScaleVertical(16),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
  getStartedText: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
    color: colors.white,
    letterSpacing: 0.3,
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: moderateScaleVertical(16),
  },
  alreadyAccountText: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: colors.textSecondary,
  },
  signInLink: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(13),
    color: colors.primaryBlue,
  },
});

export default IntroScreen;
