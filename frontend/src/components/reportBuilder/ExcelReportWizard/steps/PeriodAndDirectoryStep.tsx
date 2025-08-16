import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Alert, 
  Card, 
  CardContent, 
  Checkbox, 
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { ExcelReportData } from '../ExcelReportWizard';
import type { CompanyDirectory } from '@/store/slices/companyDirectoriesSlice';

interface PeriodAndDirectoryStepProps {
  data: ExcelReportData;
  directories: CompanyDirectory[];
  loading: boolean;
  onDataChange: (data: Partial<ExcelReportData>) => void;
}

export const PeriodAndDirectoryStep: React.FC<PeriodAndDirectoryStepProps> = ({
  data,
  directories,
  loading,
  onDataChange
}) => {
  const { t } = useTranslation();

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      onDataChange({ startDate: date.toISOString().split('T')[0] });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      onDataChange({ endDate: date.toISOString().split('T')[0] });
    }
  };

  const handleDirectoryToggle = (directoryId: string) => {
    const currentSelected = data.selectedDirectories;
    const newSelected = currentSelected.includes(directoryId)
      ? currentSelected.filter(id => id !== directoryId)
      : [...currentSelected, directoryId];
    
    onDataChange({ selectedDirectories: newSelected });
  };

  const handleSelectAll = () => {
    const allDirectoryIds = directories.map(dir => dir.id);
    onDataChange({ selectedDirectories: allDirectoryIds });
  };

  const handleDeselectAll = () => {
    onDataChange({ selectedDirectories: [] });
  };

  const startDate = data.startDate ? new Date(data.startDate) : null;
  const endDate = data.endDate ? new Date(data.endDate) : null;
  const isDateRangeValid = startDate && endDate && startDate <= endDate;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Period Selection Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Icon 
              icon="mdi:calendar-range" 
              style={{ fontSize: '24px', color: '#3b82f6', marginRight: '12px' }} 
            />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
              {t('reports.wizard.selectPeriod', 'Select Report Period')}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('reports.wizard.periodDescription', 'Choose the date range for your Excel report. This will filter the data based on the selected period.')}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <DatePicker
              label={t('reports.wizard.startDate', 'Start Date')}
              value={startDate}
              onChange={handleStartDateChange}
              maxDate={endDate || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  placeholder: t('reports.wizard.selectStartDate', 'Select start date')
                }
              }}
            />
            <DatePicker
              label={t('reports.wizard.endDate', 'End Date')}
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  placeholder: t('reports.wizard.selectEndDate', 'Select end date')
                }
              }}
            />
          </Box>

          {startDate && endDate && !isDateRangeValid && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {t('reports.wizard.invalidDateRange', 'End date must be after start date')}
            </Alert>
          )}

          {isDateRangeValid && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {t('reports.wizard.validDateRange', 'Date range selected: {{startDate}} to {{endDate}}', {
                startDate: startDate.toLocaleDateString(),
                endDate: endDate.toLocaleDateString()
              })}
            </Alert>
          )}

          {/* Quick Period Selection */}
          <Box sx={{ mt: 3, p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
              {t('reports.wizard.quickPeriods', 'Quick Period Selection')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[
                { label: 'reports.wizard.lastWeek', days: 7 },
                { label: 'reports.wizard.lastMonth', days: 30 },
                { label: 'reports.wizard.lastQuarter', days: 90 },
                { label: 'reports.wizard.lastYear', days: 365 }
              ].map((period) => (
                <TextField
                  key={period.label}
                  variant="outlined"
                  size="small"
                  value={t(period.label)}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - period.days);
                    onDataChange({
                      startDate: start.toISOString().split('T')[0],
                      endDate: end.toISOString().split('T')[0]
                    });
                  }}
                  sx={{
                    cursor: 'pointer',
                    '& .MuiOutlinedInput-root': {
                      '&:hover': {
                        borderColor: '#3b82f6',
                        backgroundColor: '#f0f9ff'
                      }
                    }
                  }}
                  InputProps={{
                    readOnly: true,
                    style: { cursor: 'pointer' }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Directory Selection Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Icon 
                icon="mdi:folder-multiple" 
                style={{ fontSize: '24px', color: '#3b82f6', marginRight: '12px' }} 
              />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                {t('reports.wizard.selectDirectories', 'Select Directories')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={t('reports.wizard.selectAll', 'Select All')}
                onClick={handleSelectAll}
                variant="outlined"
                size="small"
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label={t('reports.wizard.deselectAll', 'Deselect All')}
                onClick={handleDeselectAll}
                variant="outlined"
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('reports.wizard.directoryDescription', 'Choose which directories to include in your Excel report. You can select multiple directories.')}
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : directories.length === 0 ? (
            <Alert severity="info">
              {t('reports.wizard.noDirectories', 'No enabled directories available for this company.')}
            </Alert>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
              {directories.map((directory) => (
                <Card 
                  key={directory.id}
                  sx={{ 
                    cursor: 'pointer',
                    border: data.selectedDirectories.includes(directory.id) 
                      ? '2px solid #3b82f6' 
                      : '1px solid #e0e0e0',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 4px 8px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onClick={() => handleDirectoryToggle(directory.id)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Checkbox
                        checked={data.selectedDirectories.includes(directory.id)}
                        onChange={() => handleDirectoryToggle(directory.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mr: 1 }}
                      />
                      <Icon 
                        icon={directory.icon_name || 'mdi:folder'} 
                        style={{ fontSize: '20px', color: '#666', marginRight: '8px' }} 
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {directory.name}
                      </Typography>
                    </Box>
                    {directory.directory_type && (
                      <Chip
                        label={directory.directory_type}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {data.selectedDirectories.length > 0 && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {t('reports.wizard.directoriesSelected', '{{count}} directory(ies) selected', {
                count: data.selectedDirectories.length
              })}
            </Alert>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
