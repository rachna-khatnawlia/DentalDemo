import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface loginInterface {
    accessToken: string
}

const initialState: loginInterface = {
    accessToken: "",
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
  },
})

// Action creators are generated for each case reducer function
export const { onLogin, onLogout } = authSlice.actions

export default authSlice.reducer