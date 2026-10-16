import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/models";

export interface AuthState {
  accessToken: string;
  isIntroShown: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: "",
  isIntroShown: false,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    onLogin: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    onLogout: (state) => {
      state.accessToken = "";
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setIntroShown: (state, action: PayloadAction<boolean>) => {
      state.isIntroShown = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  onLogin,
  setUser,
  onLogout,
  setIntroShown,
  setAuthLoading,
  setAuthError,
} = authSlice.actions;

export default authSlice.reducer;