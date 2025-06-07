import React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
  {
    label: 'Dashboard',
    icon: 'solar:home-2-linear',
    path: '/dashboard',
  },
  {
    label: 'Clients',
    icon: 'solar:users-group-rounded-linear',
    path: '/clients',
  },
  {
    label: 'Directories',
    icon: 'solar:folder-outline',
    path: '/directories',
  },
  {
    label: 'Companies',
    icon: 'solar:case-round-minimalistic-outline',
    path: '/companies',
  },
];

// Mock user role (replace with Redux/store selector as needed)
const userRole = 'super_admin';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // In a real app, filter menuItems based on userRole
  const items = userRole === 'super_admin' ? menuItems : [];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80, // Position below header
        left: 10,
        height: 'calc(100vh - 120px)', // Subtract header height
        width: 240,
        bgcolor: 'transparent',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        pt: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 10,
          bgcolor: '#fff',
          py: 2,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
        }}
      >
        <List sx={{ width: '100%', p: 0 }}>
          {items.map((item) => (
            <ListItemButton
              key={item.label}
              sx={{
                borderRadius: 3,
                my: 1,
                px: 2,
                minHeight: 56,
                '&.Mui-selected': {
                  bgcolor: '#eef2f5',
                },
              }}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#1a1e1c' }}>
                <Icon icon={item.icon} width={24} height={24} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#1a1e1c'
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Sidebar; 