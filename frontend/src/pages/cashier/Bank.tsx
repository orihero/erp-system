import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const Bank: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1e1c' }}>
          {t('Bank')}
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
          {t('New Transaction')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: '#fff',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#1a1e1c' }}>
              {t('Cash Balance')}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1e1c' }}>
              $0.00
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: '#fff',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#1a1e1c' }}>
              {t('Recent Transactions')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('No transactions found')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Bank; 