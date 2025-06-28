import { Icon } from '@iconify/react';
import { Avatar, Box, IconButton, Menu, MenuItem, Paper, Typography, Tabs, Tab } from '@mui/material';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import type { NavigationModule } from '@/api/services/types';

export default function DashboardHeader() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const modules: NavigationModule[] = useSelector((state: RootState) => state.navigation.modules) || [];
  const [tabValue, setTabValue] = useState(() => {
    // Find the current module index based on the route
    const currentPath = window.location.pathname;
    const idx = modules.findIndex((mod) => currentPath.startsWith(`/modules/${mod.id}`));
    return idx >= 0 ? idx : 0;
  });

  React.useEffect(() => {
    // Update tab when route changes
    const currentPath = window.location.pathname;
    const idx = modules.findIndex((mod) => currentPath.startsWith(`/modules/${mod.id}`));
    if (idx >= 0 && idx !== tabValue) setTabValue(idx);
  }, [window.location.pathname, modules]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (modules[newValue]) {
      navigate(`/modules/${modules[newValue].id}`);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  return (
    <Box sx={{ bgcolor: '#eef2f5', width: '100%', minHeight: 0, pb: 0, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
      {/* Header Card */}
      <Paper elevation={0} sx={{
        width: '98%',
        borderRadius: '32px',
        bgcolor: '#fff',
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
        px: 4,
        pt: 1,
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        zIndex: 1100,
        mx: 'auto',
        mt: 1,
        left: 0,
        right: 0,
      }}>
        {/* Left: Logo & App Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: '#3b82f6', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box component="span" sx={{ color: '#fff', fontWeight: 700, fontSize: 28 }}>+</Box>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
            OSON ERP
          </Typography>
        </Box>
        {/* Center: Module Tab Bar */}
        {modules.length > 1 && (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ 
              minHeight: 48,
              '& .MuiTabs-indicator': {
                display: 'none', // Remove the default underline indicator
              },
              '& .MuiTabs-flexContainer': {
                gap: 1, // Add gap between tabs
              }
            }}
          >
            {modules.map((mod, index) => (
              <Tab
                key={mod.id}
                label={mod.name}
                icon={mod.icon_name ? <Icon icon={mod.icon_name} width={18} height={18} /> : undefined}
                iconPosition="start"
                sx={{ 
                  fontWeight: 500, 
                  fontSize: 14, 
                  minHeight: 36,
                  textTransform: 'none',
                  borderRadius: '24px',
                  px: 2.5,
                  py: 0.75,
                  mx: 0.25,
                  minWidth: 'auto',
                  transition: 'all 0.2s ease-in-out',
                  ...(tabValue === index ? {
                    // Active tab styling - dark pill
                    bgcolor: '#1a202c',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#1a202c',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#fff',
                    }
                  } : {
                    // Inactive tab styling - transparent background
                    bgcolor: 'transparent',
                    color: '#64748b',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.04)',
                      color: '#475569',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#64748b',
                    }
                  })
                }}
              />
            ))}
          </Tabs>
        )}
        {/* Right: Icons and User in bubbles */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: '#eef2f5', borderRadius: 999, p: 0.5, display: 'flex', alignItems: 'center', mr: 1 }}>
            <IconButton size="medium" sx={{ color: '#222', bgcolor: 'transparent' }}>
              <Icon icon="solar:bell-linear" width={24} height={24} />
            </IconButton>
          </Box>
          <Box sx={{ bgcolor: '#eef2f5', borderRadius: 999, p: 0.5, display: 'flex', alignItems: 'center', mr: 1 }}>
            <IconButton size="medium" sx={{ color: '#222', bgcolor: 'transparent' }}>
              <Icon icon="teenyicons:cog-outline" width={24} height={24} />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 999, px: 2, py: 0.5 }}>
            <Avatar sx={{ width: 40, height: 40, mr: 1 }} />
            <Box sx={{ textAlign: 'right', mr: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'User' : 'User'}</Typography>
              <Typography sx={{ fontSize: 12, color: '#888', textAlign: 'left' }}>{user?.email || ''}</Typography>
            </Box>
            <IconButton onClick={handleMenu} size="small" sx={{ color: '#222' }}>
              <Icon icon="mdi:chevron-down" width={24} height={24} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
