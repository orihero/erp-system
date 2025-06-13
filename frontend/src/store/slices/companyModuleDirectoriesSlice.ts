import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Module } from '@/api/services/modules';
import type { Directory } from '@/api/services/directories';

export interface CompanyModuleDirectory extends Directory {
  is_enabled: boolean;
  company_directory_id?: string;
}

interface CompanyModuleDirectoriesState {
  modules: Module[];
  directoriesByModule: Record<string, CompanyModuleDirectory[]>;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyModuleDirectoriesState = {
  modules: [],
  directoriesByModule: {},
  loading: false,
  error: null,
};

const companyModuleDirectoriesSlice = createSlice({
  name: 'companyModuleDirectories',
  initialState,
  reducers: {
    fetchCompanyModuleDirectoriesStart: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompanyModuleDirectoriesSuccess: (state, action: PayloadAction<{
      modules: Module[];
      directoriesByModule: Record<string, CompanyModuleDirectory[]>;
    }>) => {
      state.loading = false;
      state.modules = action.payload.modules;
      state.directoriesByModule = action.payload.directoriesByModule;
    },
    fetchCompanyModuleDirectoriesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchCompanyModuleDirectoriesStart,
  fetchCompanyModuleDirectoriesSuccess,
  fetchCompanyModuleDirectoriesFailure
} = companyModuleDirectoriesSlice.actions;

export default companyModuleDirectoriesSlice.reducer; 