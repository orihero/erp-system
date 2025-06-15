import React, { useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import DirectoryRecordsTable from '@/pages/directories/components/DirectoryRecordsTable';

// Placeholder for the company directory ID for receipts
// This should be replaced with the actual ID from the backend for the Receipts directory under the Cashier module
const RECEIPTS_DIRECTORY_ID = 'placeholder-receipts-directory-id';

const Receipts: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Note: Additional logic to fetch or set the correct companyDirectoryId for receipts
  // can be added here if dynamic retrieval is needed.

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1e1c' }}>
          {t('Receipts')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="solar:add-circle-bold" />}
          sx={{
            bgcolor: '#1a1e1c',
            '&:hover': { bgcolor: '#2c3230' },
            borderRadius: 2,
            px: 3,
            py: 1,
          }}
        >
          {t('New Receipt')}
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: '#fff',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
        }}
      >
        <DirectoryRecordsTable companyDirectoryId={RECEIPTS_DIRECTORY_ID} />
      </Paper>
    </Box>
  );
};

export default Receipts;
