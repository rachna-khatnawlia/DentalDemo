import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Routes from "./src/navigation/routes";
import { setUnauthorizedCallback } from "./src/services/apiClient";
import { onLogout } from "./src/redux/slice/authSlice";
import socketService from "./src/services/socketService";

const AppLoader = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Intercept 401 Unauthorized from any API call to gracefully handle expired session
    setUnauthorizedCallback(() => {
      dispatch(onLogout());
    });

    socketService.init();

    return () => {
      socketService.destroy();
    };
  }, [dispatch]);

  return <Routes />;
};

export default AppLoader;
