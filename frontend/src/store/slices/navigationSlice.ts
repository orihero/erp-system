import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NavigationResponse } from '@/api/services/types';

interface NavigationState extends NavigationResponse {
  currentModule?: {
    id: string;
    name: string;
    description?: string;
    icon_name?: string;
  } | null;
}

const initialState: NavigationState = {
  modules: [],
  companyDirectories: [],
  systemDirectories: [],
  hasExcelReportAccess: false,
  currentModule: null,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setNavigation: (state, action: PayloadAction<NavigationResponse>) => {
      state.modules = action.payload.modules;
      state.companyDirectories = action.payload.companyDirectories;
      state.systemDirectories = action.payload.systemDirectories;
      state.hasExcelReportAccess = action.payload.hasExcelReportAccess || false;
      
      // Set current module to first module if not set
      if (action.payload.modules.length > 0 && !state.currentModule) {
        state.currentModule = action.payload.modules[0];
      }
    },
    setCurrentModule: (state, action: PayloadAction<{
      id: string;
      name: string;
      description?: string;
      icon_name?: string;
    }>) => {
      state.currentModule = action.payload;
    },
    clearNavigation: (state) => {
      state.modules = [];
      state.companyDirectories = [];
      state.systemDirectories = [];
      state.hasExcelReportAccess = false;
      state.currentModule = null;
    },
  },
});

export const { setNavigation, setCurrentModule, clearNavigation } = navigationSlice.actions;
export default navigationSlice.reducer; 