import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import DirectoriesTable from './components/DirectoriesTable';
import AddDirectoryDrawer from './components/AddDirectoryDrawer';

const Directories: React.FC = () => {
  const { t } = useTranslation();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, width: '100%' }}>
        <Typography variant="h4" fontWeight={700}>
          {t('directories.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="ph:plus" />}
          onClick={() => setIsAddDrawerOpen(true)}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            bgcolor: '#3b82f6',
            '&:hover': {
              bgcolor: '#2563eb',
            },
          }}
        >
          {t('directories.addNew')}
        </Button>
      </Box>

      <DirectoriesTable />

      <AddDirectoryDrawer
        open={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
      />
    </Box>
  );
};

export default Directories; 