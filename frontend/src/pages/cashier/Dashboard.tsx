import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';

const CashierDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Cashier Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Today's Sales Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: '#fff',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  bgcolor: '#eef2f5',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Icon icon="solar:chart-2-linear" width={24} height={24} color="#3b82f6" />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Today's Sales
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} color="#3b82f6">
              $1,234.56
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              +12.5% from yesterday
            </Typography>
          </Paper>
        </Grid>

        {/* Total Transactions */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: '#fff',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  bgcolor: '#eef2f5',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Icon icon="solar:receipt-linear" width={24} height={24} color="#10b981" />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Transactions
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} color="#10b981">
              45
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              +5 from yesterday
            </Typography>
          </Paper>
        </Grid>

        {/* Average Transaction Value */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: '#fff',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  bgcolor: '#eef2f5',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Icon icon="solar:chart-line-linear" width={24} height={24} color="#f59e0b" />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Avg. Transaction
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} color="#f59e0b">
              $27.43
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              +2.3% from yesterday
            </Typography>
          </Paper>
        </Grid>

        {/* Products Sold */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: '#fff',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  bgcolor: '#eef2f5',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Icon icon="solar:box-linear" width={24} height={24} color="#ef4444" />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Products Sold
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} color="#ef4444">
              156
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              +8.2% from yesterday
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CashierDashboard; 