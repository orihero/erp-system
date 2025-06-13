import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Module } from '@/api/services/modules';

interface ModulesState {
  modules: Module[];
  loading: boolean;
  error: string | null;
  updating: Record<string, boolean>;
}

interface ToggleModulePayload {
  companyId: string;
  moduleId: string;
}

interface UpdateModulePayload {
  moduleId: string;
  data: Partial<Module>;
}

const initialState: ModulesState = {
  modules: [],
  loading: false,
  error: null,
  updating: {}
};

const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    fetchModulesStart: (state, action: PayloadAction<string | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchModulesSuccess: (state, action: PayloadAction<Module[]>) => {
      state.modules = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchModulesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    toggleModuleStart: (state, action: PayloadAction<ToggleModulePayload>) => {
      state.updating[action.payload.moduleId] = true;
    },
    toggleModuleSuccess: (state, action: PayloadAction<Module>) => {
      state.modules = state.modules.map(module =>
        module.id === action.payload.id
          ? { ...module, is_enabled: action.payload.is_enabled }
          : module
      );
      state.updating[action.payload.id] = false;
    },
    toggleModuleFailure: (state, action: PayloadAction<{ moduleId: string; error: string }>) => {
      state.updating[action.payload.moduleId] = false;
      state.error = action.payload.error;
    },
    updateModuleStart: (state, action: PayloadAction<UpdateModulePayload>) => {
      state.updating[action.payload.moduleId] = true;
    },
    updateModuleSuccess: (state, action: PayloadAction<Module>) => {
      state.modules = state.modules.map(module =>
        module.id === action.payload.id ? action.payload : module
      );
      state.updating[action.payload.id] = false;
    },
    updateModuleFailure: (state, action: PayloadAction<{ moduleId: string; error: string }>) => {
      state.updating[action.payload.moduleId] = false;
      state.error = action.payload.error;
    }
  }
});

export const {
  fetchModulesStart,
  fetchModulesSuccess,
  fetchModulesFailure,
  toggleModuleStart,
  toggleModuleSuccess,
  toggleModuleFailure,
  updateModuleStart,
  updateModuleSuccess,
  updateModuleFailure
} = modulesSlice.actions;

// Selectors
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

export const selectModules = (state: RootState) => state.modules.modules;

export const selectEnabledModules = createSelector(
  [selectModules],
  (modules) => modules.filter((module) => module.is_enabled)
);

export default modulesSlice.reducer;
