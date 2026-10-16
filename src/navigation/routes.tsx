import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onLogin, onLogout, setIntroShown, setUser } from "../redux/slice/authSlice";
import MainStack from "./MainStack";
import AuthStack from "./AuthStack";
import SplashScreen from "../screens/AuthScreens/SplashScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SecureStorage from "../services/secureStorage";
import authService from "../services/authService";

const Stack = createNativeStackNavigator();

const Routes = () => {
  const dispatch = useDispatch();
  const { accessToken, isIntroShown } = useSelector(
    (state: any) => state?.persisted?.auth || {}
  );
  const [localIntroShown, setLocalIntroShown] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Check intro status and validate session on launch
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // 1. Check Intro Screen Shown Status
        const introVal = await AsyncStorage.getItem("isIntroShown");
        if (introVal === "true") {
          setLocalIntroShown(true);
          if (!isIntroShown) {
            dispatch(setIntroShown(true));
          }
        }

        // 2. Check Secure Storage for authentication token
        const secureToken = await SecureStorage.getToken();
        if (secureToken) {
          if (!accessToken) {
            dispatch(onLogin(secureToken));
          }
          // Validate session with backend /auth/me
          const currentUser = await authService.getMe();
          if (currentUser) {
            dispatch(setUser(currentUser));
          }
        } else if (accessToken) {
          // If Redux had old token but SecureStore is empty, sync token to SecureStore
          await SecureStorage.setToken(accessToken);
        }
      } catch (error) {
        console.warn("[Routes] Session initialization error:", error);
      }
    };

    initializeSession();
  }, [isIntroShown, accessToken, dispatch]);

  const hasSeenIntro = Boolean(isIntroShown || localIntroShown);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
          {accessToken ? MainStack(Stack) : AuthStack(Stack, hasSeenIntro)}
        </Stack.Navigator>
      </NavigationContainer>
      <Modal
        visible={showSplash}
        animationType="fade"
        statusBarTranslucent
        transparent={false}
      >
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Routes;
