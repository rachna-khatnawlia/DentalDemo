import React from "react";
import NavigationStrings from "./NavigationStrings";
import Dashboard from "../screens/MainScreens/Dashboard";
import DoctorDetail from "../screens/MainScreens/DoctorDetail";
import SelectTreatment from "../screens/MainScreens/SelectTreatment";
import BookAppointment from "../screens/MainScreens/BookAppointment";
import Profile from "../screens/MainScreens/Profile";
import NotificationScreen from "../screens/MainScreens/NotificationScreen";
import EditProfile from "../screens/MainScreens/EditProfile";
import HelpCenter from "../screens/MainScreens/HelpCenter";
import MyAppointments from "../screens/MainScreens/MyAppointments";

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
        name={NavigationStrings.SELECT_TREATMENT}
        component={SelectTreatment}
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
      <Stack.Screen
        name={NavigationStrings.EDIT_PROFILE}
        component={EditProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationStrings.HELP_CENTER}
        component={HelpCenter}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationStrings.MY_APPOINTMENTS}
        component={MyAppointments}
        options={{ headerShown: false }}
      />
    </>
  );
};


export default MainStack;

