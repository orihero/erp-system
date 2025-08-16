import React, { useState } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, Collapse, Divider, Tooltip } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Directory } from '@/api/services/types';
import { useTranslationWithFallback } from '@/hooks/useTranslationWithFallback';

// Static sidebar config for super_admin
const superAdminSidebar = [
  { label: 'sidebar.dashboard', defaultLabel: 'Dashboard', path: '/', icon: 'si:dashboard-line' },
  { label: 'sidebar.companies', defaultLabel: 'Companies', path: '/companies', icon: 'solar:shop-linear' },
  { label: 'sidebar.directories', defaultLabel: 'Directories', path: '/directories', icon: 'solar:folder-outline' },
  { label: 'sidebar.clients', defaultLabel: 'Clients', path: '/clients', icon: 'solar:users-group-rounded-linear' },
  { label: 'sidebar.userRoles', defaultLabel: 'User Roles', path: '/user-roles', icon: 'solar:user-id-linear' },
  { label: 'sidebar.modules', defaultLabel: 'Modules', path: '/modules', icon: 'streamline-flex:module-puzzle-2-remix' },
  { label: 'sidebar.reports', defaultLabel: 'Reports', path: '/reports', icon: 'streamline-plump:file-report' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const modules = useSelector((state: RootState) => state.navigation.modules);
  const companyDirectories = useSelector((state: RootState) => state.navigation.companyDirectories);
  const hasExcelReportAccess = useSelector((state: RootState) => state.navigation.hasExcelReportAccess);
  const isCollapsed = useSelector((state: RootState) => state.sidebar.isCollapsed);
  const { tWithFallback } = useTranslationWithFallback();

  // Determine if user is super_admin with no company
  const isSuperAdmin = user && Array.isArray(user.roles) && user.roles.some((role) => role.name === 'super_admin') && (user.company_id === null || user.company_id === undefined);

  // Settings item for the bottom
  const settingsItem = {
    label: tWithFallback('sidebar.settings', 'Settings'),
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
      <Tooltip key={dir.id} title={isCollapsed ? dir.name : ''} placement="right">
        <ListItemButton
          sx={{
            borderRadius: 3,
            my: 0.5,
            pl: isCollapsed ? 1 : 2 + indent,
            minHeight: 48,
            width: '100%',
            boxSizing: 'border-box',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            '&.Mui-selected': { bgcolor: '#eef2f5' },
          }}
          selected={location.pathname === `/directories/${dir.id}`}
          onClick={() => {
            console.log('Sidebar navigation debug:', {
              isSuperAdmin,
              user,
              userCompanyId: user?.company_id,
              userCompany: user?.company,
              dir
            });
            
            // For super admin, navigate without company info
            if (isSuperAdmin) {
              navigate(`/directories/${dir.id}`);
            } else {
              // For regular users, include company information
              navigate(`/directories/${dir.id}`, {
                state: {
                  companyId: user?.company_id,
                  companyName: user?.company?.name,
                  directoryName: dir.name
                }
              });
            }
          }}
        >
          {dir.icon_name && (
            <ListItemIcon sx={{ 
              minWidth: isCollapsed ? 0 : 40, 
              color: '#1a1e1c',
              justifyContent: 'center'
            }}>
              <Icon icon={dir.icon_name} width={22} height={22} />
            </ListItemIcon>
          )}
          {!isCollapsed && (
            <ListItemText
              primary={dir.name}
              primaryTypographyProps={{ fontSize: 14, fontWeight: 400, color: '#1a1e1c' }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    ))
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 128, // 80 (header) + 48 (tabbar)
        left: 10,
        height: 'calc(100vh - 168px)', // 120 + 48 (tabbar)
        width: isCollapsed ? 80 : 240,
        bgcolor: 'transparent',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        pt: 3,
        overflow: 'hidden',
        transition: 'width 0.3s ease',
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
          px: isCollapsed ? 1 : 2,
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
              <Tooltip title={isCollapsed ? tWithFallback(item.label, item.defaultLabel) : ''} placement="right">
                <ListItemButton
                  key={item.label}
                  sx={{ 
                    borderRadius: 3, 
                    my: 1, 
                    px: isCollapsed ? 1 : 2, 
                    minHeight: 56, 
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    '&.Mui-selected': { bgcolor: '#eef2f5' } 
                  }}
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon && (
                    <ListItemIcon sx={{ 
                      minWidth: isCollapsed ? 0 : 40, 
                      color: '#1a1e1c',
                      justifyContent: 'center'
                    }}>
                      <Icon icon={item.icon} width={24} height={24} />
                    </ListItemIcon>
                  )}
                  {!isCollapsed && (
                    <ListItemText
                      primary={tWithFallback(item.label, item.defaultLabel)}
                      primaryTypographyProps={{ fontSize: 15, fontWeight: 500, color: '#1a1e1c' }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            ))
          ) : (
            <>
              {/* Module Directories (type: module) */}
              {renderDirectoryList(moduleDirectories)}
              {/* Company Directories (type: company) grouped under 'Directories' */}
              {companyTypeDirectories.length > 0 && !isCollapsed && (
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
                      primary={tWithFallback('sidebar.directories', 'Directories')}
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
              {/* Show company directories directly when collapsed */}
              {companyTypeDirectories.length > 0 && isCollapsed && (
                <>
                  {renderDirectoryList(companyTypeDirectories, 0)}
                </>
              )}
              
            </>
          )}
        </List>
        
        {/* Reports menu item for non-super admin users with Excel report access */}
        {!isSuperAdmin && hasExcelReportAccess && (
          <>
            <Divider sx={{ my: 2 }} />
            <List sx={{ width: '100%', p: 0 }}>
              <Tooltip title={isCollapsed ? tWithFallback('sidebar.reports', 'Reports') : ''} placement="right">
                <ListItemButton
                  sx={{ 
                    borderRadius: 3, 
                    my: 1, 
                    px: isCollapsed ? 1 : 2, 
                    minHeight: 56, 
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    '&.Mui-selected': { bgcolor: '#eef2f5' } 
                  }}
                  selected={location.pathname === '/reports'}
                  onClick={() => navigate('/reports')}
                >
                  <ListItemIcon sx={{ 
                    minWidth: isCollapsed ? 0 : 40, 
                    color: '#1a1e1c',
                    justifyContent: 'center'
                  }}>
                    <Icon icon="streamline-plump:file-report" width={24} height={24} />
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={tWithFallback('sidebar.reports', 'Reports')}
                      primaryTypographyProps={{ fontSize: 15, fontWeight: 500, color: '#1a1e1c' }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </List>
          </>
        )}
        
        {/* Settings section at the bottom for non-super_admin */}
        {!isSuperAdmin && (
          <>
            <List sx={{ width: '100%', p: 0 }}>
              <Tooltip title={isCollapsed ? settingsItem.label : ''} placement="right">
                <ListItemButton
                  key={settingsItem.label}
                  sx={{ 
                    borderRadius: 3, 
                    my: 1, 
                    px: isCollapsed ? 1 : 2, 
                    minHeight: 56, 
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    '&.Mui-selected': { bgcolor: '#eef2f5' } 
                  }}
                  selected={location.pathname === settingsItem.path}
                  onClick={() => navigate(settingsItem.path)}
                >
                  {settingsItem.icon && (
                    <ListItemIcon sx={{ 
                      minWidth: isCollapsed ? 0 : 40, 
                      color: '#1a1e1c',
                      justifyContent: 'center'
                    }}>
                      <Icon icon={settingsItem.icon} width={24} height={24} />
                    </ListItemIcon>
                  )}
                  {!isCollapsed && (
                    <ListItemText
                      primary={settingsItem.label}
                      primaryTypographyProps={{ fontSize: 15, fontWeight: 500, color: '#1a1e1c' }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </List>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Sidebar;
