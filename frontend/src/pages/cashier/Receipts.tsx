import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const Receipts: React.FC = () => {
  const { t } = useTranslation();

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
        {/* Receipts list will go here */}
        <Typography variant="body1" color="text.secondary">
          {t('No receipts found')}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Receipts; 