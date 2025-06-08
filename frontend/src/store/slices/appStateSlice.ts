import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Module } from '@/api/services/modules';

interface AppState {
  currentModule: Module | null;
  language: string;
  theme: 'light' | 'dark';
}

const initialState: AppState = {
  currentModule: null,
  language: 'en',
  theme: 'light',
};

const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setCurrentModule: (state, action: PayloadAction<Module | null>) => {
      state.currentModule = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const { setCurrentModule, setLanguage, setTheme } = appStateSlice.actions;
export default appStateSlice.reducer; 