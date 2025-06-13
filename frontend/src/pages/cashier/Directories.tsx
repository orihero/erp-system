import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const Directories: React.FC = () => {
  const { t } = useTranslation();

  const directories = [
    {
      title: t('Products'),
      icon: 'solar:box-linear',
      description: t('Manage products and inventory'),
    },
    {
      title: t('Customers'),
      icon: 'solar:users-group-rounded-linear',
      description: t('Manage customer information'),
    },
    {
      title: t('Payment Methods'),
      icon: 'solar:card-linear',
      description: t('Configure payment methods'),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1e1c' }}>
          {t('Directories')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {directories.map((directory) => (
          <Grid key={directory.title} item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: '#fff',
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Icon icon={directory.icon} width={48} height={48} style={{ marginBottom: 16 }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#1a1e1c' }}>
                {directory.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {directory.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Directories; 