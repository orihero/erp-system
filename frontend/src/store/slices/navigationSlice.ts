import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NavigationItem } from '@/api/services/types';

interface NavigationState {
  navigation: NavigationItem[];
  secondaryNavigation: NavigationItem[];
}

const initialState: NavigationState = {
  navigation: [],
  secondaryNavigation: [],
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setNavigation: (state, action: PayloadAction<NavigationItem[]>) => {
      state.navigation = action.payload;
    },
    clearNavigation: (state) => {
      state.navigation = [];
    },
    setSecondaryNavigation: (state, action: PayloadAction<NavigationItem[]>) => {
      state.secondaryNavigation = action.payload;
    },
    clearSecondaryNavigation: (state) => {
      state.secondaryNavigation = [];
    },
  },
});

export const { setNavigation, clearNavigation, setSecondaryNavigation, clearSecondaryNavigation } = navigationSlice.actions;
export default navigationSlice.reducer; 