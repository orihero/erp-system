import React from 'react';
import {
  Box,
  Typography,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import type { Directory } from '@/api/services/directories';

interface PreviewStepProps {
  insertType: string;
  selectedDirectory: Directory | null;
  selectedFilters: string[];
  selectedSorting: string[];
  selectedGrouping: string[];
  selectedJoins: string[];
  companyId?: string;
}

interface DirectoryRecord {
  id: string;
  recordValues?: Array<{
    field_id: string;
    value: string | number | boolean;
  }>;
}

interface DirectoryField {
  id: string;
  name: string;
  type: string;
  metadata?: {
    isFilterable?: boolean;
    isVisibleOnTable?: boolean;
    fieldOrder?: number;
  };
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  insertType,
  selectedDirectory,
  selectedFilters,
  selectedSorting,
  selectedGrouping,
  selectedJoins,
  companyId
}) => {
  const { t } = useTranslation();

  // Convert selectedSorting to backend format
  const backendSorting = selectedSorting.map(sort => {
    const [field, direction] = sort.split(' ');
    return {
      field,
      direction: direction as 'ASC' | 'DESC'
    };
  });

  // Convert selectedFilters to backend format
  const backendFilters: Record<string, string | number | boolean> = {};
  selectedFilters.forEach(filter => {
    const [fieldId, operator] = filter.split(':');
    if (fieldId && operator) {
      backendFilters[`${fieldId}:${operator}`] = true;
    }
  });

  // Fetch preview data
  const { data: directoryData, isLoading: recordsLoading, error: recordsError } = useDirectoryRecords(
    selectedDirectory?.id || '',
    companyId || '',
    { 
      search: '',
      filters: backendFilters,
      sorting: backendSorting
    }
  );

  const fields = directoryData?.fields || [];
  const records = directoryData?.directoryRecords || [];

  // Get display fields (those visible on table)
  const displayFields = fields
    .filter(field => field.metadata?.isVisibleOnTable !== false)
    .sort((a, b) => Number(a.metadata?.fieldOrder ?? 0) - Number(b.metadata?.fieldOrder ?? 0));

  // Helper function to get field value
  const getFieldValue = (record: DirectoryRecord, field: DirectoryField) => {
    const valueObj = record.recordValues?.find((v) => v.field_id === field.id);
    return valueObj ? String(valueObj.value) : '-';
  };

  const getInsertTypeIcon = () => {
    switch (insertType) {
      case 'text':
        return 'mdi:format-text';
      case 'table':
        return 'mdi:table';
      case 'chart':
        return 'mdi:chart-line';
      default:
        return 'mdi:plus';
    }
  };

  const getInsertTypeTitle = () => {
    switch (insertType) {
      case 'text':
        return t('reports.insertText', 'Text');
      case 'table':
        return t('reports.insertTable', 'Table');
      case 'chart':
        return t('reports.insertChart', 'Chart');
      default:
        return t('reports.insert', 'Insert');
    }
  };

  // Get sort info for a field
  const getSortInfo = (fieldName: string) => {
    const sortInfo = selectedSorting.find(sort => sort.startsWith(fieldName + ' '));
    if (sortInfo) {
      const direction = sortInfo.split(' ')[1];
      return { isSorted: true, direction };
    }
    return { isSorted: false, direction: null };
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('wizard.previewTitle', 'Preview your {{insertType}}', { insertType: getInsertTypeTitle() })}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('wizard.previewDescription', 'Review your configuration before inserting')}
      </Typography>

      {/* Configuration Summary */}
      <Accordion defaultExpanded sx={{ mb: 3 }}>
        <AccordionSummary>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon icon="mdi:cog" style={{ fontSize: '18px' }} />
            {t('wizard.configurationSummary', 'Configuration Summary')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Selected Directory */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('wizard.selectedDirectory', 'Selected Directory')}
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon="mdi:folder" style={{ fontSize: '16px', color: '#3b82f6' }} />
                    {selectedDirectory?.name || t('wizard.noDirectorySelected', 'No directory selected')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Filters */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('wizard.filters', 'Filters')}
                  </Typography>
                  {selectedFilters.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedFilters.map((filter, index) => (
                        <Chip
                          key={index}
                          label={filter}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('wizard.noFilters', 'No filters applied')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sorting */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('wizard.sorting', 'Sorting')}
                  </Typography>
                  {selectedSorting.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedSorting.map((sort, index) => (
                        <Chip
                          key={index}
                          label={sort}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('wizard.noSorting', 'No sorting applied')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Grouping */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('wizard.grouping', 'Grouping')}
                  </Typography>
                  {selectedGrouping.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedGrouping.map((group, index) => (
                        <Chip
                          key={index}
                          label={group}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('wizard.noGrouping', 'No grouping applied')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Joins */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('wizard.joins', 'Joins')}
                  </Typography>
                  {selectedJoins.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedJoins.map((join, index) => (
                        <Chip
                          key={index}
                          label={join}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('wizard.noJoins', 'No joins applied')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Records Count */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('wizard.recordsCount', 'Records Count')}
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon="mdi:database" style={{ fontSize: '16px', color: '#059669' }} />
                    {recordsLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      `${records.length} ${t('wizard.records', 'records')}`
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Table Preview */}
      {insertType === 'table' && selectedDirectory && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="mdi:table" style={{ fontSize: '20px', color: '#3b82f6' }} />
              {t('wizard.tablePreview', 'Table Preview')}
            </Typography>
            
            {recordsError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {t('wizard.previewError', 'Error loading preview data')}
              </Alert>
            ) : recordsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">
                    {t('wizard.loadingPreview', 'Loading preview data...')}
                  </Typography>
                </Box>
              </Box>
            ) : records.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('wizard.noRecordsFound', 'No records found with the current configuration. Try adjusting your filters or check if the directory has data.')}
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {displayFields.map((field) => {
                        const sortInfo = getSortInfo(field.name);
                        return (
                          <TableCell key={field.id} sx={{ fontWeight: 'bold' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {field.name}
                              {sortInfo.isSorted && (
                                <Icon 
                                  icon={sortInfo.direction === 'ASC' ? 'mdi:sort-ascending' : 'mdi:sort-descending'} 
                                  style={{ 
                                    fontSize: '14px',
                                    color: '#3b82f6'
                                  }} 
                                />
                              )}
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.slice(0, 10).map((record, index) => (
                      <TableRow key={record.id} hover>
                        {displayFields.map((field) => (
                          <TableCell key={field.id}>
                            {getFieldValue(record as DirectoryRecord, field)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {records.length > 10 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {t('wizard.showingFirst10', 'Showing first 10 of {{total}} records', { total: records.length })}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other Insert Types Preview */}
      {insertType !== 'table' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Icon 
                icon={getInsertTypeIcon()} 
                style={{ fontSize: '64px', color: '#9ca3af', marginBottom: '16px' }} 
              />
              <Typography variant="body1" color="text.secondary">
                {t('wizard.previewComingSoon', 'Preview functionality coming soon...')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('wizard.previewNote', 'The actual preview will show the {{insertType}} with your selected configuration', { 
                  insertType: getInsertTypeTitle().toLowerCase() 
                })}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Preview Information */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>💡 Preview Information:</strong>
          <br />
          • {t('wizard.previewInfo1', 'This preview shows how your {{insertType}} will appear with the current configuration', { insertType: getInsertTypeTitle().toLowerCase() })}
          <br />
          • {t('wizard.previewInfo2', 'Filters, sorting, and grouping are applied to show the exact result')}
          <br />
          • {t('wizard.previewInfo3', 'The final insertion will include all records, not just the preview sample')}
        </Typography>
      </Alert>
    </Box>
  );
};

export default PreviewStep; 