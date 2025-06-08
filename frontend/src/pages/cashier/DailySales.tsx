import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Icon } from '@iconify/react';

const DailySales: React.FC = () => {
  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Daily Sales
        </Typography>
        <Button
          variant="outlined"
          endIcon={<Icon icon="hugeicons:download-01" width={22} height={22} />}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 16,
            bgcolor: '#fff',
            borderColor: '#ececec',
            color: '#222',
            pl: 3,
            height: 48,
            '&:hover': {
              bgcolor: '#f6f7fb',
            },
            pr: 1,
          }}
        >
          Export Report
        </Button>
      </Box>

      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: '#fff',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
        }}
      >
        {/* Sales chart and summary will be added here */}
        <Typography variant="body1" color="text.secondary">
          Sales chart and summary coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default DailySales; 