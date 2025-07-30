import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import { RootState } from '@/store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Alert,
  CircularProgress,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountBalanceIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { DirectoryEntry, DirectoryField } from '@/api/services/directories';
import BankStatementUpload from './BankStatementUpload';

interface BankStatementRecord {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface GroupedRecords {
  [groupValue: string]: BankStatementRecord[];
}

const BankStatement: React.FC = () => {
  const { directoryId } = useParams<{ directoryId: string }>();
  const companyId = useSelector((state: RootState) => state.auth.user?.company_id);
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: fullData,
    isLoading,
    error,
    refetch
  } = useDirectoryRecords(directoryId || '', companyId || '');

  // Get grouping configuration from directory metadata
  const groupByField = useMemo(() => {
    if (!fullData?.directory?.metadata) return null;
    const metadata = fullData.directory.metadata as Record<string, unknown>;
    return (metadata.groupBy as string) || null;
  }, [fullData?.directory?.metadata]);

  // Parse directory records into bank statement format
  const groupedRecords = useMemo(() => {
    if (!fullData?.directoryRecords || !fullData?.directory?.fields) return {};

    const records = fullData.directoryRecords as DirectoryEntry[];
    const fields = fullData.directory.fields as DirectoryField[];
    
    // Sort fields by order
    const sortedFields = fields.sort((a, b) => {
      const orderA = (a.metadata?.fieldOrder as number) || 0;
      const orderB = (b.metadata?.fieldOrder as number) || 0;
      return orderA - orderB;
    });

    const grouped: GroupedRecords = {};

    records.forEach(record => {
      const recordData: Partial<BankStatementRecord> = { id: record.id };
      
      // Map record values to fields
      record.values?.forEach(value => {
        const field = sortedFields.find(f => f.id === value.attribute_id);
        if (field) {
          const fieldName = field.name;
          (recordData as Record<string, unknown>)[fieldName] = value.value;
        }
      });

      // Determine group value
      let groupValue = 'Unknown';
      if (groupByField) {
        // Find the field by name
        const groupField = sortedFields.find(f => f.name === groupByField);
        if (groupField) {
          const groupValueObj = record.values?.find(v => v.attribute_id === groupField.id);
          groupValue = groupValueObj ? String(groupValueObj.value) : 'Unknown';
        }
      } else {
        // No grouping, put all records in a single group
        groupValue = 'All Records';
      }

      if (!grouped[groupValue]) {
        grouped[groupValue] = [];
      }
      grouped[groupValue].push(recordData as BankStatementRecord);
    });

    return grouped;
  }, [fullData, groupByField]);

  const handleGroupToggle = (groupValue: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupValue)) {
      newExpanded.delete(groupValue);
    } else {
      newExpanded.add(groupValue);
    }
    setExpandedGroups(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatValue = (value: string | number | boolean | null | undefined, field: DirectoryField) => {
    if (value === null || value === undefined) return '-';
    
    switch (field.type) {
      case 'date':
        return formatDate(String(value));
      case 'decimal':
      case 'number':
      case 'integer':
        return typeof value === 'number' ? formatCurrency(value) : String(value);
      default:
        return String(value);
    }
  };

  const getVisibleFields = (fields: DirectoryField[]) => {
    return fields.filter(field => 
      field.metadata?.isVisibleOnTable !== false
    );
  };

  const handleUploadComplete = () => {
    refetch();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {t('bankStatement.error', 'Error loading bank statements')}: {String(error)}
      </Alert>
    );
  }

  const fileNames = Object.keys(groupedRecords);
  const fields = fullData?.directory?.fields as DirectoryField[] || [];
  const sortedFields = fields.sort((a, b) => {
    const orderA = (a.metadata?.fieldOrder as number) || 0;
    const orderB = (b.metadata?.fieldOrder as number) || 0;
    return orderA - orderB;
  });
  const visibleFields = getVisibleFields(sortedFields);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AccountBalanceIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700}>
          {t('bankStatement.management', 'Bank Statement Management')}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={t('bankStatement.tabs.records', 'Records')} 
            icon={<AccountBalanceIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={t('bankStatement.tabs.upload', 'Upload')} 
            icon={<CloudUploadIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {fileNames.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" align="center">
                  {t('bankStatement.noRecords', 'No bank statement records found')}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  {t('bankStatement.uploadToGetStarted', 'Upload files to get started')}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setActiveTab(1)}
                  >
                    {t('bankStatement.uploadNow', 'Upload Files')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box>
              {fileNames.map(groupValue => {
                const records = groupedRecords[groupValue];
                const isExpanded = expandedGroups.has(groupValue);

                // Calculate totals for numeric fields
                const totals: Record<string, number> = {};
                visibleFields.forEach(field => {
                  if (['decimal', 'number', 'integer'].includes(field.type)) {
                    totals[field.name] = records.reduce((sum, record) => {
                      const value = record[field.name];
                      return sum + (typeof value === 'number' ? value : 0);
                    }, 0);
                  }
                });

                return (
                  <Accordion 
                    key={groupValue}
                    expanded={isExpanded}
                    onChange={() => handleGroupToggle(groupValue)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {groupValue}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {records.length} {t('bankStatement.records', 'records')}
                            {Object.entries(totals).map(([fieldName, total]) => (
                              <span key={fieldName}>
                                {' • '}{fieldName}: {formatCurrency(total)}
                              </span>
                            ))}
                          </Typography>
                        </Box>
                        <Chip 
                          label={records.length} 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {visibleFields.map(field => (
                                <TableCell 
                                  key={field.id}
                                  align={['decimal', 'number', 'integer'].includes(field.type) ? 'right' : 'left'}
                                >
                                  {field.metadata?.label || field.name}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {records.map((record, index) => (
                              <TableRow key={`${record.id}-${index}`}>
                                {visibleFields.map(field => (
                                  <TableCell 
                                    key={field.id}
                                    align={['decimal', 'number', 'integer'].includes(field.type) ? 'right' : 'left'}
                                  >
                                    {field.type === 'text' && typeof record[field.name] === 'string' && record[field.name] && (record[field.name] as string).length > 50 ? (
                                      <Tooltip title={record[field.name] as string}>
                                        <Typography variant="body2" noWrap>
                                          {record[field.name] as string}
                                        </Typography>
                                      </Tooltip>
                                    ) : (
                                      formatValue(record[field.name], field)
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                            {Object.keys(totals).length > 0 && (
                              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                <TableCell colSpan={visibleFields.length - Object.keys(totals).length}>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {t('bankStatement.totals', 'Totals')}
                                  </Typography>
                                </TableCell>
                                {visibleFields.map(field => {
                                  if (totals[field.name] !== undefined) {
                                    return (
                                      <TableCell key={field.id} align="right">
                                        <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                                          {formatCurrency(totals[field.name])}
                                        </Typography>
                                      </TableCell>
                                    );
                                  }
                                  return null;
                                })}
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </>
      )}

      {activeTab === 1 && (
        <BankStatementUpload onUploadComplete={handleUploadComplete} />
      )}
    </Box>
  );
};

export default BankStatement; 