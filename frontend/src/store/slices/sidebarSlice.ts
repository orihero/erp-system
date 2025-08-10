import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  isCollapsed: boolean;
}

// Get initial state from localStorage
const getInitialState = (): SidebarState => {
  const savedState = localStorage.getItem('sidebarCollapsed');
  return {
    isCollapsed: savedState ? JSON.parse(savedState) : false,
  };
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: getInitialState(),
  reducers: {
    toggleSidebar: (state) => {
      state.isCollapsed = !state.isCollapsed;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(state.isCollapsed));
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isCollapsed = action.payload;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(state.isCollapsed));
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed } = sidebarSlice.actions;
export default sidebarSlice.reducer; 