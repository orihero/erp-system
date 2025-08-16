import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Card, 
  CardContent, 
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { ExcelReportData } from '../ExcelReportWizard';
import type { Company } from '@/api/services/companies';
import type { CompanyDirectory } from '@/store/slices/companyDirectoriesSlice';

interface ReportPreviewStepProps {
  data: ExcelReportData;
  company: Company;
  directories: CompanyDirectory[];
  onDataChange: (data: Partial<ExcelReportData>) => void;
}

export const ReportPreviewStep: React.FC<ReportPreviewStepProps> = ({
  data,
  company,
  directories,
  onDataChange
}) => {
  const { t } = useTranslation();

  const handleReportNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ reportName: event.target.value });
  };

  const startDate = data.startDate ? new Date(data.startDate) : null;
  const endDate = data.endDate ? new Date(data.endDate) : null;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon 
            icon="mdi:file-excel" 
            style={{ fontSize: '24px', color: '#3b82f6', marginRight: '12px' }} 
          />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
            {t('reports.wizard.reportPreview', 'Report Preview')}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t('reports.wizard.previewDescription', 'Review your report configuration and provide a name for your Excel report.')}
        </Typography>
      </Box>

      {/* Report Name Input */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
          {t('reports.wizard.reportName', 'Report Name')}
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          label={t('reports.wizard.enterReportName', 'Enter report name')}
          value={data.reportName}
          onChange={handleReportNameChange}
          placeholder={t('reports.wizard.reportNamePlaceholder', 'e.g., Monthly Sales Report')}
          sx={{ mb: 2 }}
        />
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

      {/* Generation Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {t('reports.wizard.generationInfo', 'Your Excel report will be generated with data from the selected directories for the specified period. The report will be available for download once processing is complete.')}
        </Typography>
      </Alert>

      {/* Validation */}
      {!data.reportName && (
        <Alert severity="warning">
          {t('reports.wizard.enterReportNameWarning', 'Please enter a name for your report')}
        </Alert>
      )}
    </Box>
  );
};
