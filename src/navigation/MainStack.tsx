//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import NavigationStrings from "./NavigationStrings";
import Dashboard from "../screens/MainScreens/Dashboard";

// create a component
const MainStack = (Stack: any) => {
  return (
    <>
      <Stack.Screen
        name={NavigationStrings.DASHBOARD}
        component={Dashboard}
        options={{ headerShown: false }}
      />
    </>
  );
};

// define your styles
const styles = StyleSheet.create({});

//make this component available to the app
export default MainStack;
