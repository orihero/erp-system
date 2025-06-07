import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  open: boolean;
}

const initialState: NotificationState = {
  message: '',
  type: 'info',
  open: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<{ message: string; type: NotificationState['type'] }>) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.open = true;
    },
    hideNotification: (state) => {
      state.open = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer; 