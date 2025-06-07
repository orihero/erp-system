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
}

const initialState: CompanyDirectoriesState = {
  allDirectories: [],
  companyDirectories: [],
  loading: false,
  error: null,
  updating: {}
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
    }
  }
});

export const {
  fetchCompanyDirectories,
  fetchCompanyDirectoriesSuccess,
  fetchCompanyDirectoriesFailure,
  toggleCompanyDirectory,
  toggleCompanyDirectorySuccess,
  toggleCompanyDirectoryFailure
} = companyDirectoriesSlice.actions;

export default companyDirectoriesSlice.reducer; 