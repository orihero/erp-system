import React, { useEffect, useState } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, Collapse, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { fetchCompanyModuleDirectoriesStart } from '@/store/slices/companyModuleDirectoriesSlice';
import type { NavigationItem } from '@/api/services/types';

// Static sidebar config for super_admin
const superAdminSidebar: NavigationItem[] = [
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
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useSelector((state: RootState) => state.navigation.navigation);
  const secondaryNavigation = useSelector((state: RootState) => state.navigation.secondaryNavigation);
  const safeNavigation = Array.isArray(navigation) ? navigation : [];
  const safeSecondaryNavigation = Array.isArray(secondaryNavigation) ? secondaryNavigation : [];
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [secondaryOpen, setSecondaryOpen] = useState(false);

  useEffect(() => {
    if (user && user.company_id) {
      dispatch(fetchCompanyModuleDirectoriesStart(user.company_id));
    } else if (user && user.company && user.company.id) {
      dispatch(fetchCompanyModuleDirectoriesStart(user.company.id));
    }
  }, [user, dispatch]);

  // --- Step 2.1: Determine Access Level ---
  // For demo: if navigation has more than 6 items, treat as comprehensive access (adjust as needed)
  const hasComprehensiveAccess = safeNavigation.length > 6;

  // Determine if user is super_admin with no company
  const isSuperAdmin = user && Array.isArray(user.roles) && user.roles.some((role) => role.name === 'super_admin') && (user.company_id === null || user.company_id === undefined);

  // --- Step 2.2: Render Primary Navigation Items ---
  const renderNavItems = (items: NavigationItem[], nested = false) => (
    items.map((item) => {
      const isExpanded = expanded[String(item.label)] || false;
      const handleExpandClick = () => {
        setExpanded({ ...expanded, [String(item.label)]: !isExpanded });
      };
      const hasChildren = item.children && item.children.length > 0;
      return (
        <React.Fragment key={item.label}>
          <ListItemButton
            sx={{
              borderRadius: 3,
              my: nested ? 0.5 : 1,
              px: nested ? 4 : 2,
              minHeight: 56,
              '&.Mui-selected': {
                bgcolor: '#eef2f5',
              },
            }}
            selected={location.pathname === item.path}
            onClick={hasChildren ? handleExpandClick : () => navigate(item.path)}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: 40, color: '#1a1e1c' }}>
                <Icon icon={item.icon} width={24} height={24} />
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 500,
                color: '#1a1e1c',
              }}
            />
            {hasChildren && (
              <Icon icon={isExpanded ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} width={16} height={16} />
            )}
          </ListItemButton>
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderNavItems(item.children!, true)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    })
  );

  // --- Step 2.3: Render Secondary Navigation Group ---
  const renderSecondaryNav = () => (
    <>
      <Divider sx={{ my: 2 }} />
      <ListItemButton
        sx={{ borderRadius: 3, my: 1, px: 2, minHeight: 56 }}
        onClick={() => setSecondaryOpen((open) => !open)}
      >
        <ListItemIcon sx={{ minWidth: 40, color: '#1a1e1c' }}>
          <Icon icon="solar:menu-dots-bold" width={24} height={24} />
        </ListItemIcon>
        <ListItemText
          primary="More"
          primaryTypographyProps={{ fontSize: 15, fontWeight: 500, color: '#1a1e1c' }}
        />
        <Icon icon={secondaryOpen ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} width={16} height={16} />
      </ListItemButton>
      <Collapse in={secondaryOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {renderNavItems(safeSecondaryNavigation, true)}
        </List>
      </Collapse>
    </>
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
        <List sx={{ width: '100%', p: 0, flex: 1 }}>
          {/* Render static sidebar for super_admin with no company */}
          {isSuperAdmin
            ? renderNavItems(superAdminSidebar)
            : hasComprehensiveAccess
              ? renderNavItems(safeNavigation)
              : renderNavItems(safeNavigation)}
        </List>
        {/* Secondary navigation group at the bottom if present and not comprehensive access */}
        {!isSuperAdmin && !hasComprehensiveAccess && safeSecondaryNavigation.length > 0 && renderSecondaryNav()}
      </Paper>
    </Box>
  );
};

export default Sidebar;
