import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar';
import DashboardHeader from '../DashboardHeader';

interface LayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 250;
const HEADER_HEIGHT = 80;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#eef2f5' }}>
      {/* Full width fixed header */}
      <DashboardHeader />
      {/* Sidebar and main content, with top padding for header */}
      <Box sx={{ display: 'flex', pt: `${HEADER_HEIGHT}px` }}>
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
          <Sidebar />
        </Box>
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
            display: 'flex',
            flexDirection: 'column',
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