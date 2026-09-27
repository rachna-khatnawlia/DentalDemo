//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import fontFamily from "../constants/fontFamily";
import NavigationStrings from "./NavigationStrings";
import MainStack from "./MainStack";
import AuthStack from "./AuthStack";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/AuthScreens/Login";

// create a component
const Stack = createNativeStackNavigator();
const Routes = () => {
  const { accessToken } = useSelector((state: any) => state?.persisted?.auth);
  console.log("in routes accesstoken", accessToken ? "true" : "false");

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
          {accessToken ? (
            MainStack(Stack)
          ) : (
            <Stack.Screen
              name={NavigationStrings.LOGIN}
              component={Login}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

//make this component available to the app
export default Routes;
