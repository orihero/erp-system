import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Icon } from '@iconify/react';

const Products: React.FC = () => {
  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="ph:plus" />}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            bgcolor: '#3b82f6',
            '&:hover': {
              bgcolor: '#2563eb',
            },
          }}
        >
          Add Product
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
        {/* Products table will be added here */}
        <Typography variant="body1" color="text.secondary">
          Products table coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Products; 