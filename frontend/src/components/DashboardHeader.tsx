import { Icon } from '@iconify/react';
import { Avatar, Box, IconButton, Menu, MenuItem, Paper, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import { fetchModulesStart } from '@/store/slices/modulesSlice';
import { setCurrentModule } from '@/store/slices/appStateSlice';
import type { RootState } from '@/store';
import type { Module } from '@/api/services/modules';

export default function DashboardHeader() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const companyId = user?.company?.id;
  const enabledModules = useSelector((state: RootState) =>
    (state.modules.modules as Module[]).filter((m) => m.is_enabled)
  );
  const currentModule = useSelector((state: RootState) => state.appState.currentModule);
  const isOwner = user?.roles.includes('owner');

  useEffect(() => {
    if (isOwner && companyId) {
      dispatch(fetchModulesStart(companyId));
    }
  }, [dispatch, isOwner, companyId]);

  const handleModuleChange = (_: React.SyntheticEvent, newValue: number) => {
    const selectedModule = enabledModules[newValue];
    dispatch(setCurrentModule(selectedModule));
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
        position: 'relative',
        zIndex: 2,
        mx: 'auto',
        mt: 1
      }}>
        {/* Left: Logo & App Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: '#3b82f6', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box component="span" sx={{ color: '#fff', fontWeight: 700, fontSize: 28 }}>+</Box>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
            Symptra
          </Typography>
        </Box>
        {/* Center: Nav Tabs in pill container, only for owner */}
        {isOwner && (
          <Box sx={{ bgcolor: '#eef2f5', borderRadius: 999, px: 1, py: 0.5, display: 'flex', alignItems: 'center', width: 'fit-content' }}>
            <Tabs
              value={currentModule ? enabledModules.findIndex(m => m.id === currentModule.id) : 0}
              onChange={handleModuleChange}
              sx={{ minHeight: 0, "&.Mui-selected": { color: '#fff' } }}
              slotProps={{ indicator: { style: { display: 'none' }, } }}
            >
              {enabledModules.map((mod, idx) => (
                <Tab
                  key={mod.id}
                  label={mod.name}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: 16,
                    color: '#222',
                    bgcolor: 'transparent',
                    borderRadius: 999,
                    px: 3,
                    minHeight: 40,
                    mr: 0.5,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      color: '#fff',
                      bgcolor: '#1a1e1c',
                    },
                    '&:hover': {
                      bgcolor: currentModule?.id === mod.id ? '#1a1e1c' : '#ececec',
                    },
                  }}
                />
              ))}
            </Tabs>
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
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{user ? user.name || 'User' : 'User'}</Typography>
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