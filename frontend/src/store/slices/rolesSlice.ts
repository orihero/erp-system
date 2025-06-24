import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserRole } from '@/api/services/roles';

interface RolesState {
  roles: UserRole[];
  loading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    fetchRolesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRolesSuccess: (state, action: PayloadAction<UserRole[]>) => {
      state.roles = action.payload;
      state.loading = false;
    },
    fetchRolesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createRoleStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createRoleSuccess: (state, action: PayloadAction<UserRole>) => {
      state.roles.push(action.payload);
      state.loading = false;
    },
    createRoleFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateRoleStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateRoleSuccess: (state, action: PayloadAction<UserRole>) => {
      const idx = state.roles.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) state.roles[idx] = action.payload;
      state.loading = false;
    },
    updateRoleFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteRoleStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteRoleSuccess: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter(r => r.id !== action.payload);
      state.loading = false;
    },
    deleteRoleFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchRolesStart, fetchRolesSuccess, fetchRolesFailure, createRoleStart, createRoleSuccess, createRoleFailure, updateRoleStart, updateRoleSuccess, updateRoleFailure, deleteRoleStart, deleteRoleSuccess, deleteRoleFailure } = rolesSlice.actions;
export default rolesSlice.reducer; 