import { FontAwesome } from "@expo/vector-icons";
import * as Font from "expo-font";
// import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          ...FontAwesome.font,
          "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
          "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
          "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
          "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
          "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
