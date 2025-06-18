import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../api/services/types";
import { authService } from "../../api/services/auth.service";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  permissions: string[];
}

interface SignupPayload {
  email: string;
  password: string;
  company_name: string;
  employee_count: string;
}

// interface LoginPayload {
//   email: string;
//   password: string;
//   remember: boolean;
// }

const getStoredToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const initialState: AuthState = {
  user: null,
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
  permissions: authService.getUserPermissions(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (
      state,
      action?: PayloadAction<{
        email: string;
        password: string;
        remember: boolean;
      }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string; permissions?: string[] }>
    ) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      if (action.payload.permissions) {
        state.permissions = action.payload.permissions;
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.permissions = [];
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.permissions = [];
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    signupStart: (state, action: PayloadAction<SignupPayload>) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateUser,
  signupStart,
  signupSuccess,
  signupFailure 
} = authSlice.actions;
export default authSlice.reducer;
