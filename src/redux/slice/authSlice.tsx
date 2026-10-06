import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface loginInterface {
    accessToken: string;
    isIntroShown: boolean;
}

const initialState: loginInterface = {
    accessToken: "",
    isIntroShown: false,
}

export const authSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    onLogin: (state, action: PayloadAction<string>) => {
      state.accessToken = action?.payload;
    },
    onLogout: (state) => {
      state.accessToken = "";
    },
    setIntroShown: (state, action: PayloadAction<boolean>) => {
      state.isIntroShown = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { onLogin, onLogout, setIntroShown } = authSlice.actions

export default authSlice.reducer