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
  },
});

export const { fetchRolesStart, fetchRolesSuccess, fetchRolesFailure } = rolesSlice.actions;
export default rolesSlice.reducer; 