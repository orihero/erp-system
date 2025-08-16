import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, CircularProgress, Grid, TextField } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { excelReportTemplateAPI, type ExcelReportTemplate } from '@/api/services/excelReportTemplates';

interface TemplateWithPeriod extends ExcelReportTemplate {
  startDate?: string;
  endDate?: string;
}

const ExcelReports: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const currentModule = useSelector((state: RootState) => state.navigation.currentModule);
  const [templates, setTemplates] = useState<TemplateWithPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    if (!user?.company_id) return;
    
    setLoading(true);
    try {
      const params: { moduleId?: string } = {};
      if (currentModule?.id) {
        params.moduleId = currentModule.id;
      }
      
      const response = await excelReportTemplateAPI.getTemplates(user.company_id, params);
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching Excel report templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user?.company_id, currentModule?.id]);

  const handleCreateTemplate = () => {
    // Navigate to Excel report template creation
    window.open('/reports/create', '_blank');
  };

  const handlePeriodChange = (templateId: string, field: 'startDate' | 'endDate', value: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, [field]: value }
        : template
    ));
  };

  const handleGenerate = async (template: TemplateWithPeriod) => {
    if (!template.startDate || !template.endDate) return;
    
    setGeneratingId(template.id);
    try {
      const response = await excelReportTemplateAPI.generateExcel(template.id, {
        startDate: template.startDate,
        endDate: template.endDate,
        selectedDirectories: template.selected_directories || []
      });
      
      // Create a download link for the generated file
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name}_${template.startDate}_${template.endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating Excel file:', error);
    } finally {
      setGeneratingId(null);
    }
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('reports.excelReports', 'Excel Reports')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="solar:add-circle-linear" />}
          onClick={handleCreateTemplate}
        >
          {t('reports.createExcelTemplate', 'Create Excel Template')}
        </Button>
      </Box>

      {templates.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Icon icon="streamline-plump:file-report" width={64} height={64} style={{ opacity: 0.5, marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('reports.noExcelTemplates', 'No Excel Report Templates')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('reports.noExcelTemplatesDescription', 'Create your first Excel report template to get started')}
          </Typography>
          <Button variant="contained" onClick={handleCreateTemplate}>
            {t('reports.createFirstTemplate', 'Create First Template')}
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid key={template.id} item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 3 }}>
                    {template.name}
                  </Typography>

                  {/* Period Picker */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t('reports.period', 'Period')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        type="date"
                        size="small"
                        value={template.startDate || ''}
                        onChange={(e) => handlePeriodChange(template.id, 'startDate', e.target.value)}
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        type="date"
                        size="small"
                        value={template.endDate || ''}
                        onChange={(e) => handlePeriodChange(template.id, 'endDate', e.target.value)}
                        sx={{ flex: 1 }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                  </Box>

                  {/* Generate Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!template.startDate || !template.endDate || generatingId === template.id}
                    onClick={() => handleGenerate(template)}
                    startIcon={
                      generatingId === template.id ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Icon icon="solar:download-linear" />
                      )
                    }
                  >
                    {generatingId === template.id 
                      ? t('reports.generating', 'Generating...') 
                      : t('reports.generate', 'Generate Report')
                    }
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ExcelReports;
