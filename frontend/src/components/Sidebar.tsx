import React, { useEffect } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, Collapse } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { useState } from 'react';
import { fetchCompanyModuleDirectoriesStart } from '@/store/slices/companyModuleDirectoriesSlice';

// Define navigation items for each role
const roleNavigationItems = {
  cashier: [
    {
      label: 'Receipts',
      icon: 'solar:document-linear',
      path: '/cashier/receipts',
    },
    {
      label: 'Bank',
      icon: 'iconoir:bank',
      path: '/cashier/bank',
    },
    {
      label: 'Reports',
      icon: 'solar:chart-2-linear',
      path: '/cashier/reports',
    },
    {
      label: 'Directories',
      icon: 'solar:folder-linear',
      path: '/cashier/directories',
      isExpandable: true,
    },
  ],
  default: [
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
      icon: 'solar:folder-linear',
      path: '/directories',
      isExpandable: true,
    },
    {
      label: 'Companies',
      icon: 'solar:buildings-linear',
      path: '/companies',
    },
    {
      label: 'Modules',
      icon: 'solar:widget-linear',
      path: '/modules',
    },
    {
      label: 'Reports',
      icon: 'solar:chart-2-linear',
      path: '/reports',
    },
  ],
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { directoriesByModule } = useSelector((state: RootState) => state.companyModuleDirectories);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    console.log('Sidebar - Current user:', user);
    console.log('Sidebar - User roles:', user?.roles);
    console.log('Sidebar - Is cashier?', user?.roles?.some((role: string) => role.toLowerCase() === 'cashier'));
    if (user && user.company_id) {
      dispatch(fetchCompanyModuleDirectoriesStart(user.company_id));
    } else if (user && user.company && user.company.id) {
      dispatch(fetchCompanyModuleDirectoriesStart(user.company.id));
    }
  }, [user, dispatch]);

  // Get navigation items based on user role
  const navigationItems = user?.roles?.some((role: string) => role.toLowerCase() === 'cashier')
    ? roleNavigationItems.cashier
    : roleNavigationItems.default;

  // Check if user is admin or super admin
  const isAdmin = user?.roles?.some((role: string) => role.toLowerCase().includes('admin') || role.toLowerCase().includes('superadmin'));

  console.log('Sidebar - Selected navigation items:', navigationItems);
  console.log('Sidebar - Is Admin or Super Admin:', isAdmin);

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
          {navigationItems.map((item) => {
            const isExpanded = expanded[item.label] || false;
            const handleExpandClick = () => {
              setExpanded({ ...expanded, [item.label]: !isExpanded });
            };

            if (item.isExpandable && !isAdmin && item.label === 'Directories') {
              // Assuming we need directories for a specific module, this can be adjusted based on current module selection
              // For simplicity, taking the first module's directories or all enabled directories
              const moduleKeys = Object.keys(directoriesByModule);
              const directories = moduleKeys.length > 0 ? directoriesByModule[moduleKeys[0]] : [];

              return (
                <React.Fragment key={item.label}>
                  <ListItemButton
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
                    onClick={handleExpandClick}
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
                    <Icon icon={isExpanded ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} width={16} height={16} />
                  </ListItemButton>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {directories.filter(dir => dir.is_enabled).map((dir) => (
                        <ListItemButton
                          key={dir.id}
                          sx={{
                            pl: 6,
                            borderRadius: 3,
                            my: 0.5,
                          }}
                          onClick={() => navigate(`${item.path}/${dir.id}`)}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: '#1a1e1c' }}>
                            <Icon icon={dir.icon_name || "solar:folder-linear"} width={20} height={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary={dir.name}
                            primaryTypographyProps={{
                              fontSize: 14,
                              color: '#1a1e1c'
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }

            return (
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
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default Sidebar;
