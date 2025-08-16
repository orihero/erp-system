import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import Sidebar from '../Sidebar';
import DashboardHeader from '../DashboardHeader';
import ModuleTabbar from '../ModuleTabbar';
import type { RootState } from '@/store';

interface LayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 80;
const TABBAR_HEIGHT = 48;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isCollapsed = useSelector((state: RootState) => state.sidebar.isCollapsed);
  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#eef2f5' }}>
      {/* Full width fixed header */}
      <DashboardHeader />
      {/* Module tabbar (fixed positioned) */}
      <ModuleTabbar />
      {/* Sidebar and main content, with top padding for header and tabbar */}
      <Box sx={{ display: 'flex', pt: `${HEADER_HEIGHT + TABBAR_HEIGHT}px` }}>
        <Box sx={{ width: sidebarWidth, flexShrink: 0, transition: 'width 0.3s ease' }}>
          <Sidebar />
        </Box>
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: `calc(100vh - ${HEADER_HEIGHT + TABBAR_HEIGHT}px)`,
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left 0.3s ease',
          }}
        >
          <Box sx={{ flexGrow: 1, p: 3 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 