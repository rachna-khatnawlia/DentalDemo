//import liraries
import { View, Text, StyleSheet } from "react-native";
import NavigationStrings from "./NavigationStrings";
import Login from "../screens/AuthScreens/Login";
import IntroScreen from "../screens/AuthScreens/IntroScreen";
import Register from "../screens/AuthScreens/Register";
import VerifyOtp from "../screens/AuthScreens/VerifyOtp";

// create a component
const AuthStack = (Stack: any, isIntroShown: boolean = false) => {
  return (
    <>
      {!isIntroShown && (
        <Stack.Screen
          name={NavigationStrings.INTRO}
          component={IntroScreen}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen
        name={NavigationStrings.LOGIN}
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationStrings.REGISTER}
        component={Register}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationStrings.VERIFY_OTP}
        component={VerifyOtp}
        options={{ headerShown: false }}
      />
    </>
  );
};

// define your styles
const styles = StyleSheet.create({});

//make this component available to the app
export default AuthStack;
