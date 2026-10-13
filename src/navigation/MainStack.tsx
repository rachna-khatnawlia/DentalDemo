import React from "react";
import NavigationStrings from "./NavigationStrings";
import Dashboard from "../screens/MainScreens/Dashboard";
import DoctorDetail from "../screens/MainScreens/DoctorDetail";
import BookAppointment from "../screens/MainScreens/BookAppointment";
import Profile from "../screens/MainScreens/Profile";
import NotificationScreen from "../screens/MainScreens/NotificationScreen";

// create a component
const MainStack = (Stack: any) => {
  return (
    <>
      <Stack.Screen
        name={NavigationStrings.DASHBOARD}
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationStrings.DOCTOR_DETAIL}
        component={DoctorDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationStrings.BOOK_APPOINTMENT}
        component={BookAppointment}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationStrings.PROFILE}
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationStrings.NOTIFICATIONS}
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
    </>
  );
};


export default MainStack;

