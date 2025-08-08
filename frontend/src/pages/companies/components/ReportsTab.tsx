import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { Company } from '@/api/services/companies';

interface ReportsTabProps {
  company: Company | undefined;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ company }) => {
  const { t } = useTranslation();

  if (!company) {
    return <Box p={3}>{t('companies.notFound', 'Company not found.')}</Box>;
  }

  const handleCreateReport = () => {
    // Open report editor in a new tab
    window.open(`/reports/editor/${company.id}`, '_blank');
  };

  return (
    <Box p={3}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          bgcolor: '#fafafa',
          borderRadius: 2,
          border: '1px dashed #d0d0d0'
        }}
      >
        <Icon 
          icon="mdi:file-document-outline" 
          style={{ fontSize: '64px', color: '#9ca3af', marginBottom: '16px' }} 
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('reports.noReports', 'No reports yet')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('reports.noReportsDescription', 'Create your first report to get started')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="mdi:plus" />}
          onClick={handleCreateReport}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            bgcolor: '#3b82f6',
            '&:hover': {
              bgcolor: '#2563eb',
            },
          }}
        >
          {t('reports.createReport', 'Create Report')}
        </Button>
      </Paper>
    </Box>
  );
};

export default ReportsTab; 