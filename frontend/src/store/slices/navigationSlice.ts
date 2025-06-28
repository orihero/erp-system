import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NavigationResponse } from '@/api/services/types';

const initialState: NavigationResponse = {
  modules: [],
  companyDirectories: [],
  systemDirectories: [],
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setNavigation: (state, action: PayloadAction<NavigationResponse>) => {
      state.modules = action.payload.modules;
      state.companyDirectories = action.payload.companyDirectories;
      state.systemDirectories = action.payload.systemDirectories;
    },
    clearNavigation: (state) => {
      state.modules = [];
      state.companyDirectories = [];
      state.systemDirectories = [];
    },
  },
});

export const { setNavigation, clearNavigation } = navigationSlice.actions;
export default navigationSlice.reducer; 