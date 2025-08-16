import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import type { Company } from '@/api/services/companies';
import { ExcelReportWizard, type ExcelReportData } from '@/components/reportBuilder/ExcelReportWizard';
import { fetchCompanyDirectories } from '@/store/slices/companyDirectoriesSlice';
import { excelReportTemplateAPI, type ExcelReportTemplate } from '@/api/services/excelReportTemplates';

interface ReportsTabProps {
  company: Company | undefined;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ company }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showWizard, setShowWizard] = useState(false);
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExcelReportTemplate | null>(null);
  const [templates, setTemplates] = useState<ExcelReportTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load templates when component mounts
  useEffect(() => {
    if (company) {
      loadTemplates();
    }
  }, [company]);

  const loadTemplates = async () => {
    if (!company) return;
    
    setLoading(true);
    try {
      const response = await excelReportTemplateAPI.getTemplates(company.id);
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async (template: ExcelReportTemplate) => {
    setDownloading(template.id);
    try {
      const response = await excelReportTemplateAPI.generateExcel(template.id, {
        startDate: template.start_date,
        endDate: template.end_date,
        selectedDirectories: template.selected_directories
      });

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
    } finally {
      setDownloading(null);
    }
  };

  const handleEditTemplate = async (template: ExcelReportTemplate) => {
    setEditingTemplate(template);
    // Load company directories first
    dispatch(fetchCompanyDirectories({ companyId: company!.id }));
    setShowEditWizard(true);
  };

  const handleDeleteTemplate = async (template: ExcelReportTemplate) => {
    if (!window.confirm(t('reports.confirmDelete', 'Are you sure you want to delete this template?'))) {
      return;
    }

    setDeleting(template.id);
    try {
      await excelReportTemplateAPI.deleteTemplate(template.id);
      // Refresh templates list
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setDeleting(null);
    }
  };

  if (!company) {
    return <Box p={3}>{t('companies.notFound', 'Company not found.')}</Box>;
  }

  const handleCreateReport = () => {
    // Load company directories first
    dispatch(fetchCompanyDirectories({ companyId: company.id }));
    setShowWizard(true);
  };

  const handleWizardComplete = (reportData: ExcelReportData) => {
    console.log('Report data:', reportData);
    // Refresh templates list
    loadTemplates();
    setShowWizard(false);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  const handleEditWizardComplete = (reportData: ExcelReportData) => {
    console.log('Edit report data:', reportData);
    // Refresh templates list
    loadTemplates();
    setShowEditWizard(false);
    setEditingTemplate(null);
  };

  const handleEditWizardCancel = () => {
    setShowEditWizard(false);
    setEditingTemplate(null);
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
          {t('reports.excelTemplates', 'Excel Report Templates')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Icon icon="mdi:refresh" />}
            onClick={loadTemplates}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: '#3b82f6',
              color: '#3b82f6',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: '#f0f9ff'
              },
            }}
          >
            {t('common.refresh', 'Refresh')}
          </Button>
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
        </Box>
      </Box>

      {/* Templates Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
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
            {t('reports.noTemplates', 'No templates yet')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('reports.noTemplatesDescription', 'Create your first Excel report template to get started')}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>{t('reports.name', 'Name')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('reports.period', 'Period')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('reports.directoriesAndModules', 'Directories & Modules')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('reports.status', 'Status')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('reports.creator', 'Creator')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('reports.created', 'Created')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('reports.actions', 'Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {template.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(template.start_date).toLocaleDateString()} - {new Date(template.end_date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Chip
                        icon={<Icon icon="mdi:folder-multiple" />}
                        label={`${template.selected_directories.length} ${t('reports.directories', 'directories')}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          borderColor: '#d1d5db'
                        }}
                      />
                      {template.selected_modules && template.selected_modules.length > 0 && (
                        <Chip
                          icon={<Icon icon="mdi:puzzle" />}
                          label={`${template.selected_modules.length} ${t('reports.modules', 'modules')}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            color: '#3b82f6',
                            borderColor: '#3b82f6'
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`reports.status.${template.status}`, template.status)}
                      size="small"
                      color={
                        template.status === 'completed' ? 'success' :
                        template.status === 'configured' ? 'warning' :
                        template.status === 'draft' ? 'default' :
                        'primary'
                      }
                      variant="outlined"
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {template.creator ? `${template.creator.firstname} ${template.creator.lastname}` : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadTemplate(template)}
                        disabled={downloading === template.id}
                        sx={{ color: '#3b82f6' }}
                        title={t('reports.downloadTemplate', 'Download Excel file')}
                      >
                        {downloading === template.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Icon icon="mdi:download" />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditTemplate(template)}
                        sx={{ color: '#6b7280' }}
                        title={t('reports.editTemplate', 'Edit template')}
                      >
                        <Icon icon="mdi:pencil" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTemplate(template)}
                        disabled={deleting === template.id}
                        sx={{ color: '#ef4444' }}
                        title={t('reports.deleteTemplate', 'Delete template')}
                      >
                        {deleting === template.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Icon icon="mdi:delete" />
                        )}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Excel Report Wizard Modal */}
      <ExcelReportWizard
        company={company}
        open={showWizard}
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />

      {/* Edit Excel Report Wizard Modal */}
      {editingTemplate && (
        <ExcelReportWizard
          company={company}
          open={showEditWizard}
          onComplete={handleEditWizardComplete}
          onCancel={handleEditWizardCancel}
          editingTemplate={editingTemplate}
        />
      )}
    </Box>
  );
};

export default ReportsTab; 