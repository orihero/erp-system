import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Directory } from '@/api/services/directories';

interface CompanyDirectory extends Directory {
  is_enabled: boolean;
}

interface CompanyDirectoriesState {
  allDirectories: CompanyDirectory[];
  companyDirectories: CompanyDirectory[];
  loading: boolean;
  error: string | null;
  updating: Record<string, boolean>;
  directoriesByModuleId: Record<string, Directory[]>;
  directoriesByModuleLoading: Record<string, boolean>;
  directoriesByModuleError: Record<string, string | null>;
  binding: boolean;
  bindingError: string | null;
}

const initialState: CompanyDirectoriesState = {
  allDirectories: [],
  companyDirectories: [],
  loading: false,
  error: null,
  updating: {},
  directoriesByModuleId: {},
  directoriesByModuleLoading: {},
  directoriesByModuleError: {},
  binding: false,
  bindingError: null,
};

const companyDirectoriesSlice = createSlice({
  name: 'companyDirectories',
  initialState,
  reducers: {
    fetchCompanyDirectories: (state, action: PayloadAction<{ companyId: string }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompanyDirectoriesSuccess: (state, action: PayloadAction<{
      allDirectories: CompanyDirectory[];
      companyDirectories: CompanyDirectory[];
    }>) => {
      state.loading = false;
      state.allDirectories = action.payload.allDirectories;
      state.companyDirectories = action.payload.companyDirectories;
    },
    fetchCompanyDirectoriesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCompanyModuleDirectories: (state, action: PayloadAction<{ companyId: string; companyModuleId: string }>) => {
      state.directoriesByModuleLoading[action.payload.companyModuleId] = true;
      state.directoriesByModuleError[action.payload.companyModuleId] = null;
    },
    fetchCompanyModuleDirectoriesSuccess: (state, action: PayloadAction<{ companyModuleId: string; directories: Directory[] }>) => {
      state.directoriesByModuleLoading[action.payload.companyModuleId] = false;
      state.directoriesByModuleId[action.payload.companyModuleId] = action.payload.directories;
    },
    fetchCompanyModuleDirectoriesFailure: (state, action: PayloadAction<{ companyModuleId: string; error: string }>) => {
      state.directoriesByModuleLoading[action.payload.companyModuleId] = false;
      state.directoriesByModuleError[action.payload.companyModuleId] = action.payload.error;
    },
    toggleCompanyDirectory: (state, action: PayloadAction<{
      companyId: string;
      directory: Directory;
      isEnabled: boolean;
    }>) => {
      const { directory } = action.payload;
      state.updating[directory.id] = true;
    },
    toggleCompanyDirectorySuccess: (state, action: PayloadAction<{
      directory: Directory;
      isEnabled: boolean;
    }>) => {
      const { directory, isEnabled } = action.payload;
      state.updating[directory.id] = false;
      
      if (isEnabled) {
        state.companyDirectories.push({ ...directory, is_enabled: true });
        state.allDirectories = state.allDirectories.map(d => 
          d.id === directory.id ? { ...d, is_enabled: true } : d
        );
      } else {
        state.companyDirectories = state.companyDirectories.filter(d => d.id !== directory.id);
        state.allDirectories = state.allDirectories.map(d => 
          d.id === directory.id ? { ...d, is_enabled: false } : d
        );
      }
    },
    toggleCompanyDirectoryFailure: (state, action: PayloadAction<{
      directoryId: string;
      error: string;
    }>) => {
      const { directoryId, error } = action.payload;
      state.updating[directoryId] = false;
      state.error = error;
    },
    bindDirectoriesToModule: (state, action: PayloadAction<{ companyId: string; companyModuleId: string; directoryIds: string[] }>) => {
      state.binding = true;
      state.bindingError = null;
    },
    bindDirectoriesToModuleSuccess: (state) => {
      state.binding = false;
      state.bindingError = null;
    },
    bindDirectoriesToModuleFailure: (state, action: PayloadAction<string>) => {
      state.binding = false;
      state.bindingError = action.payload;
    }
  }
});

export const {
  fetchCompanyDirectories,
  fetchCompanyDirectoriesSuccess,
  fetchCompanyDirectoriesFailure,
  fetchCompanyModuleDirectories,
  fetchCompanyModuleDirectoriesSuccess,
  fetchCompanyModuleDirectoriesFailure,
  toggleCompanyDirectory,
  toggleCompanyDirectorySuccess,
  toggleCompanyDirectoryFailure,
  bindDirectoriesToModule,
  bindDirectoriesToModuleSuccess,
  bindDirectoriesToModuleFailure
} = companyDirectoriesSlice.actions;

export default companyDirectoriesSlice.reducer; 