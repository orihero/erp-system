import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { authService } from '../api/services/auth.service';
import { useTranslation } from 'react-i18next';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleLogout = () => {
    // Clear authentication state
    dispatch(logout());
    authService.logout();
    // Navigate to login page
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        {t('unauthorized.403', '403')}
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        {t('unauthorized.title', 'Unauthorized Access')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('unauthorized.permission', "You don't have permission to access this page.")}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          {t('unauthorized.returnHome', 'Return to Home')}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
        >
          {t('unauthorized.logout', 'Logout')}
        </Button>
      </Stack>
    </Box>
  );
};

export default UnauthorizedPage; 