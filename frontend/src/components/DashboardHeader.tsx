import { Icon } from '@iconify/react';
import { Avatar, Box, IconButton, Menu, MenuItem, Paper, Typography, ListItemIcon, ListItemText } from '@mui/material';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import type { NavigationItem } from '@/api/services/types';

export default function DashboardHeader() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [moduleAnchorEl, setModuleAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const moduleMenuOpen = Boolean(moduleAnchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useSelector((state: RootState) => state.navigation.navigation);
  const safeNavigation = Array.isArray(navigation) ? navigation : [];

  // --- Step 3.1: Evaluate Module Count ---
  // Assume modules are top-level navigation items with a path like '/modules/...' or have a 'module' property
  // For this example, treat each top-level item as a module if it has children or a path starting with '/modules' or '/module'
  const getDistinctModules = (nav: NavigationItem[]): NavigationItem[] => {
    // You may want to adjust this logic based on your backend's navigation structure
    return nav.filter(item => item.children && item.children.length > 0 || (item.path && item.path.startsWith('/modules')));
  };
  const distinctModules = getDistinctModules(safeNavigation);
  const hasComprehensiveAccess = safeNavigation.length > 6; // Adjust as needed

  // --- Step 3.2: Conditional Display ---
  const shouldShowModuleNav = !hasComprehensiveAccess && distinctModules.length > 1;

  const handleModuleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setModuleAnchorEl(event.currentTarget);
  };
  const handleModuleClose = () => {
    setModuleAnchorEl(null);
  };
  const handleModuleSelect = (module: NavigationItem) => {
    setModuleAnchorEl(null);
    if (module.path) {
      navigate(module.path);
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
        {/* Center: Conditional Module Navigation */}
        {shouldShowModuleNav && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleModuleMenu} sx={{ bgcolor: '#eef2f5', borderRadius: 999, px: 2 }}>
              <Icon icon="solar:widget-linear" width={28} height={28} />
              <Typography sx={{ ml: 1, fontWeight: 500, fontSize: 16 }}>
                Modules
              </Typography>
              <Icon icon={moduleMenuOpen ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} width={18} height={18} style={{ marginLeft: 4 }} />
            </IconButton>
            <Menu anchorEl={moduleAnchorEl} open={moduleMenuOpen} onClose={handleModuleClose}>
              {distinctModules.map((mod) => (
                <MenuItem key={mod.label} onClick={() => handleModuleSelect(mod)}>
                  {mod.icon && (
                    <ListItemIcon>
                      <Icon icon={mod.icon} width={22} height={22} />
                    </ListItemIcon>
                  )}
                  <ListItemText primary={mod.label} />
                </MenuItem>
              ))}
            </Menu>
          </Box>
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
