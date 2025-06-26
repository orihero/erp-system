import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, Permission } from "../../api/services/types";
// import { authService } from "../../api/services/auth.service";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  permissions: Permission[];
}

// interface LoginPayload {
//   email: string;
//   password: string;
//   remember: boolean;
// }

const getStoredToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const getStoredUser = () => {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
  permissions: [], // Permissions will be set on login/profile
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
      action: PayloadAction<{ user: User; token: string; permissions?: Permission[] }>
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
    loginFailure: (state) => {
      state.loading = false;
      state.error = null;
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
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    signupStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    signupFailure: (state) => {
      state.loading = false;
      state.error = null;
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
