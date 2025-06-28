import React, { useState } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, Collapse, Divider, ListSubheader } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Directory } from '@/api/services/types';

// Static sidebar config for super_admin
const superAdminSidebar = [
  { label: 'Dashboard', path: '/', icon: 'si:dashboard-line' },
  { label: 'Companies', path: '/companies', icon: 'solar:shop-linear' },
  { label: 'Directories', path: '/directories', icon: 'solar:folder-outline' },
  { label: 'Clients', path: '/clients', icon: 'solar:users-group-rounded-linear' },
  { label: 'User Roles', path: '/user-roles', icon: 'solar:user-id-linear' },
  { label: 'Modules', path: '/modules', icon: 'streamline-flex:module-puzzle-2-remix' },
  { label: 'Reports', path: '/reports', icon: 'streamline-plump:file-report' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const modules = useSelector((state: RootState) => state.navigation.modules);
  const companyDirectories = useSelector((state: RootState) => state.navigation.companyDirectories);
  const systemDirectories = useSelector((state: RootState) => state.navigation.systemDirectories);

  // Determine if user is super_admin with no company
  const isSuperAdmin = user && Array.isArray(user.roles) && user.roles.some((role) => role.name === 'super_admin') && (user.company_id === null || user.company_id === undefined);

  // Settings item for the bottom
  const settingsItem = {
    label: 'Settings',
    path: '/settings',
    icon: 'solar:settings-bold',
  };

  // Type guard for Directory with 'directory_type'
  const hasDirectoryType = (dir: Directory): dir is Directory & { directory_type: string } => typeof (dir as { directory_type?: string }).directory_type === 'string';
  const [directoriesExpanded, setDirectoriesExpanded] = useState<boolean>(false);

  // Flatten all module directories (type === 'module')
  const moduleDirectories = (modules || []).flatMap((mod) =>
    (mod.directories || []).filter((dir) => hasDirectoryType(dir) && dir.directory_type?.toLowerCase() === 'module')
  );

  // Only company directories (type === 'company')
  const companyTypeDirectories = (companyDirectories || []).filter((dir) => hasDirectoryType(dir) && dir.directory_type?.toLowerCase() === 'company');

  // Render a list of directories
  const renderDirectoryList = (dirs: Directory[], indent: number = 0) => (
    dirs.map((dir) => (
      <ListItemButton
        key={dir.id}
        sx={{
          borderRadius: 3,
          my: 0.5,
          pl: 2 + indent,
          minHeight: 48,
          width: '100%',
          boxSizing: 'border-box',
          '&.Mui-selected': { bgcolor: '#eef2f5' },
        }}
        selected={location.pathname === `/directories/${dir.id}`}
        onClick={() => navigate(`/directories/${dir.id}`)}
      >
        {dir.icon_name && (
          <ListItemIcon sx={{ minWidth: 40, color: '#1a1e1c' }}>
            <Icon icon={dir.icon_name} width={22} height={22} />
          </ListItemIcon>
        )}
        <ListItemText
          primary={dir.name}
          primaryTypographyProps={{ fontSize: 14, fontWeight: 400, color: '#1a1e1c' }}
        />
      </ListItemButton>
    ))
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        left: 10,
        height: 'calc(100vh - 120px)',
        width: 240,
        bgcolor: 'transparent',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        pt: 3,
        overflow: 'hidden',
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
          overflow: 'hidden',
        }}
      >
        <List sx={{ width: '100%', p: 0, flex: 1 }}>
          {/* Render static sidebar for super_admin with no company */}
          {isSuperAdmin ? (
            superAdminSidebar.map((item) => (
              <ListItemButton
                key={item.label}
                sx={{ borderRadius: 3, my: 1, px: 2, minHeight: 56, '&.Mui-selected': { bgcolor: '#eef2f5' } }}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                {item.icon && (
                  <ListItemIcon sx={{ minWidth: 40, color: '#1a1e1c' }}>
                    <Icon icon={item.icon} width={24} height={24} />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 15, fontWeight: 500, color: '#1a1e1c' }}
                />
              </ListItemButton>
            ))
          ) : (
            <>
              {/* Module Directories (type: module) */}
              {renderDirectoryList(moduleDirectories)}
              {/* Company Directories (type: company) grouped under 'Directories' */}
              {companyTypeDirectories.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <ListItemButton
                    onClick={() => setDirectoriesExpanded((prev: boolean) => !prev)}
                    sx={{ borderRadius: 3, my: 1, px: 2, minHeight: 48 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: '#1a1e1c' }}>
                      <Icon icon="solar:folder-outline" width={22} height={22} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Directories"
                      primaryTypographyProps={{ fontSize: 15, fontWeight: 500, color: '#1a1e1c' }}
                    />
                    <Icon icon={directoriesExpanded ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} width={16} height={16} />
                  </ListItemButton>
                  <Collapse in={directoriesExpanded} timeout="auto" unmountOnExit>
                    <List disablePadding sx={{ width: '100%' }}>
                      {renderDirectoryList(companyTypeDirectories, 0)}
                    </List>
                  </Collapse>
                </>
              )}
              {/* System Directories (if any) */}
              {systemDirectories && systemDirectories.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <ListSubheader sx={{ pl: 2, fontWeight: 600, color: '#888' }}>System Directories</ListSubheader>
                  {renderDirectoryList(systemDirectories)}
                </>
              )}
            </>
          )}
        </List>
        {/* Settings section at the bottom for non-super_admin */}
        {!isSuperAdmin && (
          <>
            <Divider sx={{ my: 2 }} />
            <List sx={{ width: '100%', p: 0 }}>
              <ListItemButton
                key={settingsItem.label}
                sx={{ borderRadius: 3, my: 1, px: 2, minHeight: 56, '&.Mui-selected': { bgcolor: '#eef2f5' } }}
                selected={location.pathname === settingsItem.path}
                onClick={() => navigate(settingsItem.path)}
              >
                {settingsItem.icon && (
                  <ListItemIcon sx={{ minWidth: 40, color: '#1a1e1c' }}>
                    <Icon icon={settingsItem.icon} width={24} height={24} />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={settingsItem.label}
                  primaryTypographyProps={{ fontSize: 15, fontWeight: 500, color: '#1a1e1c' }}
                />
              </ListItemButton>
            </List>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Sidebar;
