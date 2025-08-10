import { Icon } from '@iconify/react';
import { Avatar, Box, IconButton, Menu, MenuItem, Paper, Typography, Tabs, Tab, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import type { RootState } from '@/store';
import type { NavigationModule } from '@/api/services/types';
import { useTranslation } from 'react-i18next';

export default function DashboardHeader() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const modules: NavigationModule[] = useSelector((state: RootState) => state.navigation.modules) || [];
  const isCollapsed = useSelector((state: RootState) => state.sidebar.isCollapsed);
  // Determine if user is super_admin with no company
  const isSuperAdmin = user && Array.isArray(user.roles) && user.roles.some((role) => role.name === 'super_admin') && (user.company_id === null || user.company_id === undefined);
  const [tabValue, setTabValue] = useState(() => {
    // Find the current module index based on the route
    const currentPath = window.location.pathname;
    const idx = modules.findIndex((mod) => currentPath.startsWith(`/modules/${mod.id}`));
    return idx >= 0 ? idx : 0;
  });

  const { t, i18n } = useTranslation();

  // Language switcher state
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const langMenuOpen = Boolean(langAnchorEl);
  const languages = [
    { code: 'en', name: t('language.english', 'English'), flag: '🇺🇸' },
    { code: 'ru', name: t('language.russian', 'Русский'), flag: '🇷🇺' },
    { code: 'uz', name: t('language.uzbek', "O'zbekcha"), flag: '🇺🇿' }
  ];

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

  const handleLangClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };
  const handleLangClose = () => {
    setLangAnchorEl(null);
  };
  const handleLangChange = async (code: string) => {
    await i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    handleLangClose();
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
        <Tooltip title={isCollapsed ? t('sidebar.expand', 'Expand Sidebar') : t('sidebar.collapse', 'Collapse Sidebar')}>
            <IconButton
              onClick={() => dispatch(toggleSidebar())}
              sx={{
                color: '#64748b',
                bgcolor: '#f8fafc',
                borderRadius: '50%',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: '#e2e8f0',
                  color: '#475569',
                },
              }}
            >
              <Icon 
                icon={!isCollapsed ? 'zondicons:dots-horizontal-triple' : 'ion:list'} 
                width={20} 
                height={20} 
              />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
            {t('app.name', 'OSON ERP')}
          </Typography>
          {/* Sidebar Toggle Button */}
          
        </Box>
        {/* Center: Module Tab Bar */}
        {!isSuperAdmin && modules.length > 1 && (
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
          {/* Language Switcher */}
          <Box sx={{ bgcolor: '#eef2f5', borderRadius: '50%', p: 0.5, display: 'flex', alignItems: 'center', mr: 1 }}>
            <IconButton size="medium" sx={{ color: '#222', bgcolor: 'transparent', borderRadius: '50%' }} onClick={handleLangClick}>
              <span style={{ fontSize: 22, borderRadius: '50%', overflow: 'hidden', display: 'inline-block', width: 28, height: 28, background: '#fff', textAlign: 'center', lineHeight: '28px' }}>
                {languages.find(l => l.code === i18n.language)?.flag || '🌐'}
              </span>
            </IconButton>
            <Menu anchorEl={langAnchorEl} open={langMenuOpen} onClose={handleLangClose}>
              {languages.map(lang => (
                <MenuItem key={lang.code} selected={i18n.language === lang.code} onClick={() => handleLangChange(lang.code)}>
                  <span style={{ marginRight: 8 }}>{lang.flag}</span> {lang.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 999, px: 2, py: 0.5 }}>
            <Avatar sx={{ width: 40, height: 40, mr: 1 }} />
            <Box sx={{ textAlign: 'right', mr: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || t('common.user', 'User') : t('common.user', 'User')}</Typography>
              <Typography sx={{ fontSize: 12, color: '#888', textAlign: 'left' }}>{user?.email || ''}</Typography>
            </Box>
            <IconButton onClick={handleMenu} size="small" sx={{ color: '#222' }}>
              <Icon icon="mdi:chevron-down" width={24} height={24} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={handleClose}>{t('common.profile', 'Profile')}</MenuItem>
              <MenuItem onClick={handleLogout}>{t('common.logout', 'Logout')}</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
