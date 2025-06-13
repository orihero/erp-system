import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Reports: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1e1c', mb: 3 }}>
        {t('Reports')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: '#fff',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#1a1e1c' }}>
              {t('Daily Sales')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('No data available')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: '#fff',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#1a1e1c' }}>
              {t('Cash Flow')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('No data available')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
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
              {t('Transaction History')}
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

export default Reports; 