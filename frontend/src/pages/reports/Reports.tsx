import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, IconButton, CircularProgress, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import reportService from '../../services/reportService';
import { ReportTemplate } from '../../types/report';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [reportStructures, setReportStructures] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const templates = await reportService.listTemplates();
      setReportStructures(Array.isArray(templates) ? templates : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateReport = () => {
    // Open report wizard in a new tab
    window.open('/reports/create', '_blank');
  };

  const handleEdit = (id: string) => {
    // Open report wizard in a new tab for editing
    window.open(`/reports/edit/${id}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await reportService.deleteTemplate(id);
      setReportStructures((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('reports.title', 'Reports')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="solar:add-circle-linear" />}
          onClick={handleCreateReport}
        >
          {t('reports.createReportStructure', 'Create Report Structure')}
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {reportStructures.map((report) => (
            <Grid item key={report.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {report.name}
                    </Typography>
                    <Box>
                      <IconButton onClick={() => handleEdit(report.id)} title={t('reports.edit', 'Edit')}>
                        <Icon icon="solar:pen-2-linear" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(report.id)} title={t('reports.delete', 'Delete')} disabled={deletingId === report.id}>
                        {deletingId === report.id ? <CircularProgress size={20} /> : <Icon icon="solar:trash-bin-trash-linear" />}
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('reports.type', 'Type')}: {report.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.createdAt ? `${t('reports.createdAt', 'Created')}: ${new Date(report.createdAt).toLocaleString()}` : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Reports; 