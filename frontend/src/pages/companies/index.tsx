import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import CompaniesTable from './components/CompaniesTable';
import AddCompanyDrawer from './components/AddCompanyDrawer';

const Companies: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, width: '100%' }}>
        <Typography variant="h4" fontWeight={700}>
          Companies
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="ph:plus" />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            bgcolor: '#3b82f6',
            '&:hover': {
              bgcolor: '#2563eb',
            },
          }}
        >
          Add Company
        </Button>
      </Box>
      <CompaniesTable />
      <AddCompanyDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
};

export default Companies; 