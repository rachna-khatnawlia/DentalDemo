import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setIntroShown } from "../redux/slice/authSlice";
import MainStack from "./MainStack";
import AuthStack from "./AuthStack";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// create a component
const Stack = createNativeStackNavigator();
const Routes = () => {
  const dispatch = useDispatch();
  const { accessToken, isIntroShown } = useSelector(
    (state: any) => state?.persisted?.auth || {},
  );
  const [localIntroShown, setLocalIntroShown] = useState(false);

  useEffect(() => {
    const checkStorageIntro = async () => {
      try {
        const value = await AsyncStorage.getItem("isIntroShown");
        if (value === "true") {
          setLocalIntroShown(true);
          if (!isIntroShown) {
            dispatch(setIntroShown(true));
          }
        }
      } catch (error) {
        console.log("Error checking isIntroShown in AsyncStorage", error);
      }
    };
    checkStorageIntro();
  }, [isIntroShown, dispatch]);

  const hasSeenIntro = Boolean(isIntroShown || localIntroShown);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
          {accessToken ? MainStack(Stack) : AuthStack(Stack, hasSeenIntro)}
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
