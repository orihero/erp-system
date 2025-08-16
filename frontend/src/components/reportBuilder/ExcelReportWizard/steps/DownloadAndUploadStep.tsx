import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  Card, 
  CardContent, 
  Chip,
  Divider,
  CircularProgress,
  Input,
  FormControl,
  InputLabel
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { ExcelReportData } from '../ExcelReportWizard';
import type { Company } from '@/api/services/companies';
import type { CompanyDirectory } from '@/store/slices/companyDirectoriesSlice';
import { excelReportTemplateAPI } from '@/api/services/excelReportTemplates';

interface DownloadAndUploadStepProps {
  data: ExcelReportData;
  company: Company;
  directories: CompanyDirectory[];
  templateId?: string | null;
}

export const DownloadAndUploadStep: React.FC<DownloadAndUploadStepProps> = ({
  data,
  company,
  directories,
  templateId
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState(data.reportName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const startDate = data.startDate ? new Date(data.startDate) : null;
  const endDate = data.endDate ? new Date(data.endDate) : null;

  const handleDownload = async () => {
    if (!templateId) {
      setError(t('reports.wizard.noTemplateId', 'Template ID is required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await excelReportTemplateAPI.generateExcel(templateId, {
        startDate: data.startDate,
        endDate: data.endDate,
        selectedDirectories: data.selectedDirectories
      });

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${company.name}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(t('reports.wizard.downloadSuccess', 'Excel file downloaded successfully'));
    } catch (error) {
      console.error('Download error:', error);
      setError(t('reports.wizard.downloadError', 'Failed to download Excel file'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['.xlsx', '.xls'];
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(ext)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError(t('reports.wizard.invalidFileType', 'Please select a valid Excel file (.xlsx or .xls)'));
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!templateId) {
      setError(t('reports.wizard.noTemplateId', 'Template ID is required'));
      return;
    }

    if (!selectedFile) {
      setError(t('reports.wizard.selectFile', 'Please select a file to upload'));
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await excelReportTemplateAPI.uploadConfiguredFile(templateId, selectedFile);
      setSuccess(t('reports.wizard.uploadSuccess', 'File uploaded successfully'));
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setError(t('reports.wizard.uploadError', 'Failed to upload file'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon 
            icon="mdi:file-excel" 
            style={{ fontSize: '24px', color: '#3b82f6', marginRight: '12px' }} 
          />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
            {t('reports.wizard.downloadAndUpload', 'Download & Upload Report')}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t('reports.wizard.downloadUploadDescription', 'Download the Excel file with your data (each directory on its own sheet), configure it if needed, and upload the completed report.')}
        </Typography>
      </Box>

      {/* Report Name Input */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
          {t('reports.wizard.reportName', 'Report Name')}
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('reports.wizard.enterReportName', 'Enter report name')}</InputLabel>
          <Input
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder={t('reports.wizard.reportNamePlaceholder', 'e.g., Monthly Sales Report')}
          />
        </FormControl>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Report Summary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#333' }}>
          {t('reports.wizard.reportSummary', 'Report Summary')}
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Company Info */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Icon 
                  icon="mdi:office-building" 
                  style={{ fontSize: '20px', color: '#666', marginRight: '8px' }} 
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('reports.wizard.company', 'Company')}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {company.name}
              </Typography>
            </CardContent>
          </Card>

          {/* Period Info */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Icon 
                  icon="mdi:calendar-range" 
                  style={{ fontSize: '20px', color: '#666', marginRight: '8px' }} 
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('reports.wizard.period', 'Period')}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {startDate && endDate 
                  ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                  : t('reports.wizard.noPeriodSelected', 'No period selected')
                }
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Directories Info */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Icon 
                icon="mdi:folder-multiple" 
                style={{ fontSize: '20px', color: '#666', marginRight: '8px' }} 
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('reports.wizard.selectedDirectories', 'Selected Directories')}
              </Typography>
            </Box>
            
            {directories.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                {t('reports.wizard.noDirectoriesSelected', 'No directories selected')}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {directories.map((directory) => (
                  <Chip
                    key={directory.id}
                    icon={<Icon icon={directory.icon_name || 'mdi:folder'} />}
                    label={directory.name}
                    variant="outlined"
                    color="primary"
                    size="small"
                  />
                ))}
              </Box>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('reports.wizard.directoriesCount', '{{count}} directory(ies) selected', {
                count: directories.length
              })}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Action Buttons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#333' }}>
          {t('reports.wizard.actions', 'Actions')}
        </Typography>

        {/* Download Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleDownload}
            disabled={loading || !templateId}
            startIcon={loading ? <CircularProgress size={20} /> : <Icon icon="mdi:download" />}
            sx={{ mb: 2 }}
          >
            {loading 
              ? t('reports.wizard.downloading', 'Downloading...') 
              : t('reports.wizard.downloadExcel', 'Download Excel File')
            }
          </Button>
          <Typography variant="body2" color="text.secondary">
            {t('reports.wizard.downloadDescription', 'Download Excel file with your data in separate sheets (one sheet per directory) and a DynamicReport sheet for configuration')}
          </Typography>
        </Box>

        {/* Upload Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {t('reports.wizard.uploadConfigured', 'Upload Configured Report')}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Icon icon="mdi:upload" />}
              disabled={uploading}
            >
              {t('reports.wizard.selectFile', 'Select File')}
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </Button>
            
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                {selectedFile.name}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !templateId}
            startIcon={uploading ? <CircularProgress size={20} /> : <Icon icon="mdi:upload" />}
            sx={{ mb: 2 }}
          >
            {uploading 
              ? t('reports.wizard.uploading', 'Uploading...') 
              : t('reports.wizard.uploadFile', 'Upload File')
            }
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            {t('reports.wizard.uploadDescription', 'Upload your configured Excel file to complete the report')}
          </Typography>
        </Box>
      </Box>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {t('reports.wizard.instructions', '1. Download the Excel file which contains your data in separate sheets (one sheet per directory with all records populated). 2. Configure your report in the DynamicReport sheet if needed. 3. Upload the completed file to finish the process.')}
        </Typography>
      </Alert>
    </Box>
  );
};
