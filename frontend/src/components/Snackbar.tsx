import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, Snackbar as MuiSnackbar } from '@mui/material';
import { RootState } from '../store';
import { hideNotification } from '../store/slices/notificationSlice';
import { useTranslationWithFallback } from '@/hooks/useTranslationWithFallback';

export const Snackbar: React.FC = () => {
  const dispatch = useDispatch();
  const { message, type, open } = useSelector((state: RootState) => state.notification);
  const { tWithFallback } = useTranslationWithFallback();

  const handleClose = () => {
    dispatch(hideNotification());
  };

  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}
        closeText={tWithFallback('common.close', 'Close')}>
        {message}
      </Alert>
    </MuiSnackbar>
  );
}; 