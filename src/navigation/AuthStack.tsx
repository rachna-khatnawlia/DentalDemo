//import liraries
import { View, Text, StyleSheet } from "react-native";
import NavigationStrings from "./NavigationStrings";
import Login from "../screens/AuthScreens/Login";
import IntroScreen from "../screens/AuthScreens/IntroScreen";

// create a component
const AuthStack = (Stack: any) => {
  return (
    <>
      <Stack.Screen
        name={NavigationStrings.INTRO}
        component={IntroScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationStrings.LOGIN}
        component={Login}
        options={{ headerShown: false }}
      />
    </>
  );
};

// define your styles
const styles = StyleSheet.create({

});

//make this component available to the app
export default AuthStack;
