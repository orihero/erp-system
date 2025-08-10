import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import { directoriesApi } from '@/api/services/directories';
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
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountBalanceIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
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

// Updated interface to match the actual API response
interface FullDataResponse {
  directory: any;
  companyDirectory: any;
  directoryRecords: any[] | Record<string, any[]>;
  fields: DirectoryField[];
}

const BankStatement: React.FC = () => {
  const { directoryId } = useParams<{ directoryId: string }>();
  const companyId = useSelector((state: RootState) => state.auth.user?.company_id);
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<BankStatementRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const {
    data: fullData,
    isLoading,
    error,
    refetch
  } = useDirectoryRecords(directoryId || '', companyId || '') as unknown as { data: FullDataResponse; isLoading: boolean; error: unknown; refetch: () => void };

  // Get grouping configuration from directory metadata
  const groupByField = useMemo(() => {
    if (!fullData?.directory?.metadata) return null;
    const metadata = fullData.directory.metadata as Record<string, unknown>;
    const groupBy = metadata.groupBy as string || null;
    console.log('BankStatement GroupBy Field:', groupBy);
    return groupBy;
  }, [fullData?.directory?.metadata]);

  // Parse directory records into bank statement format
  const groupedRecords = useMemo(() => {
    if (!fullData?.directoryRecords || !fullData?.fields) return {};

    const records = fullData.directoryRecords as any[];
    const fields = fullData.fields as DirectoryField[];
    
    console.log('BankStatement Debug:', {
      recordsCount: records.length,
      fieldsCount: fields.length,
      sampleRecord: records[0],
      sampleField: fields[0],
      fullData
    });
    
    // Sort fields by order
    const sortedFields = fields.sort((a, b) => {
      const orderA = (a.metadata?.fieldOrder as number) || 0;
      const orderB = (b.metadata?.fieldOrder as number) || 0;
      return orderA - orderB;
    });

    const grouped: GroupedRecords = {};

    // Handle both array and object formats for directoryRecords
    let recordsToProcess: any[] = [];
    if (Array.isArray(records)) {
      recordsToProcess = records;
    } else if (typeof records === 'object' && records !== null) {
      // If records is an object (grouped by backend), flatten it
      Object.values(records).forEach((groupRecords: any) => {
        if (Array.isArray(groupRecords)) {
          recordsToProcess.push(...groupRecords);
        }
      });
    }

    recordsToProcess.forEach(record => {
      const recordData: Partial<BankStatementRecord> = { id: record.id };
      
      // Map record values to fields - use recordValues with field_id
      const values = record.recordValues || [];
      console.log('Processing record:', record.id, 'with recordValues:', values);
      
      // Map each field to its value
      sortedFields.forEach(field => {
        const valueObj = values.find((value: any) => {
          return value.field_id === field.id;
        });
        
        if (valueObj) {
          const fieldName = field.name;
          (recordData as Record<string, unknown>)[fieldName] = valueObj.value;
          console.log(`Mapped field ${fieldName} = ${valueObj.value}`);
        } else {
          console.log(`No value found for field ${field.name} (${field.id})`);
        }
      });

      // Determine group value
      let groupValue = 'Unknown';
      if (groupByField) {
        // Find the field by name
        const groupField = sortedFields.find(f => f.name === groupByField);
        if (groupField) {
          const groupValueObj = values.find((v: any) => {
            return v.field_id === groupField.id;
          });
          groupValue = groupValueObj ? String(groupValueObj.value) : 'Unknown';
          console.log(`Group value for ${groupByField}: ${groupValue}`);
        } else {
          console.log(`Group field '${groupByField}' not found in sorted fields`);
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

    console.log('BankStatement Grouped Records:', grouped);
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

  const handleDeleteClick = (record: BankStatementRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete || !directoryId) return;

    setIsDeleting(true);
    try {
      await directoriesApi.deleteDirectoryEntry(directoryId, recordToDelete.id);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      refetch(); // Refresh the data
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const handleBulkDeleteClick = (groupValue: string) => {
    setGroupToDelete(groupValue);
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!groupToDelete || !directoryId || !companyId) return;

    setIsBulkDeleting(true);
    try {
      await directoriesApi.bulkDeleteByGroup(directoryId, companyId, groupToDelete);
      setBulkDeleteDialogOpen(false);
      setGroupToDelete(null);
      refetch(); // Refresh the data
    } catch (error) {
      console.error('Error bulk deleting records:', error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialogOpen(false);
    setGroupToDelete(null);
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
  const fields = fullData?.fields as DirectoryField[] || [];
  const sortedFields = fields.sort((a, b) => {
    const orderA = (a.metadata?.fieldOrder as number) || 0;
    const orderB = (b.metadata?.fieldOrder as number) || 0;
    return orderA - orderB;
  });
  const visibleFields = getVisibleFields(sortedFields);

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
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
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Tooltip title={groupValue}>
                            <Typography 
                              variant="h6" 
                              fontWeight={600}
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%'
                              }}
                            >
                              {groupValue}
                            </Typography>
                          </Tooltip>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%'
                            }}
                          >
                            {records.length} {t('bankStatement.records', 'records')}
                            {Object.entries(totals).map(([fieldName, total]) => (
                              <span key={fieldName}>
                                {' • '}{fieldName}: {formatCurrency(total)}
                              </span>
                            ))}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                          <Chip 
                            label={records.length} 
                            size="small" 
                            color="primary" 
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBulkDeleteClick(groupValue);
                            }}
                            title={t('bankStatement.deleteGroup', 'Delete all records in this group')}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer 
                        component={Paper} 
                        variant="outlined"
                        sx={{
                          maxWidth: '100%',
                          overflowX: 'auto',
                          '& .MuiTable-root': {
                            minWidth: 650,
                          }
                        }}
                      >
                        <Table size="small" sx={{ tableLayout: 'fixed' }}>
                          <TableHead>
                            <TableRow>
                              {visibleFields.map(field => (
                                <TableCell 
                                  key={field.id}
                                  align={['decimal', 'number', 'integer'].includes(field.type) ? 'right' : 'left'}
                                  sx={{
                                    width: field.name === 'fileName' ? '25%' : 
                                           field.name === 'documentDate' ? '12%' :
                                           field.name === 'account' ? '20%' :
                                           field.name === 'organizationName' ? '15%' :
                                           field.name === 'documentNumber' ? '10%' :
                                           field.name === 'documentType' ? '10%' :
                                           field.name === 'branch' ? '8%' :
                                           'auto',
                                    minWidth: field.name === 'fileName' ? 200 : 80,
                                    maxWidth: field.name === 'fileName' ? 300 : undefined,
                                  }}
                                >
                                  {field.metadata?.label || field.name}
                                </TableCell>
                              ))}
                              <TableCell align="center" sx={{ width: 80, minWidth: 80 }}>
                                {t('bankStatement.actions', 'Actions')}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {records.map((record, index) => (
                              <TableRow key={`${record.id}-${index}`}>
                                {visibleFields.map(field => (
                                  <TableCell 
                                    key={field.id}
                                    align={['decimal', 'number', 'integer'].includes(field.type) ? 'right' : 'left'}
                                    sx={{
                                      width: field.name === 'fileName' ? '25%' : 
                                             field.name === 'documentDate' ? '12%' :
                                             field.name === 'account' ? '20%' :
                                             field.name === 'organizationName' ? '15%' :
                                             field.name === 'documentNumber' ? '10%' :
                                             field.name === 'documentType' ? '10%' :
                                             field.name === 'branch' ? '8%' :
                                             'auto',
                                      minWidth: field.name === 'fileName' ? 200 : 80,
                                      maxWidth: field.name === 'fileName' ? 300 : undefined,
                                    }}
                                  >
                                    {field.type === 'text' && typeof record[field.name] === 'string' && record[field.name] && (record[field.name] as string).length > 30 ? (
                                      <Tooltip title={record[field.name] as string}>
                                        <Typography 
                                          variant="body2" 
                                          sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '100%',
                                            display: 'block'
                                          }}
                                        >
                                          {record[field.name] as string}
                                        </Typography>
                                      </Tooltip>
                                    ) : (
                                      <Typography 
                                        variant="body2"
                                        sx={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          maxWidth: '100%',
                                          display: 'block'
                                        }}
                                      >
                                        {formatValue(record[field.name], field)}
                                      </Typography>
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell align="center" sx={{ width: 80, minWidth: 80 }}>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(record)}
                                    title={t('bankStatement.deleteRecord', 'Delete record')}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
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
                                <TableCell />
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {t('bankStatement.confirmDelete', 'Confirm Delete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('bankStatement.deleteWarning', 'Are you sure you want to delete this bank statement record? This action cannot be undone.')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            {t('bankStatement.cancel', 'Cancel')}
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t('bankStatement.delete', 'Delete')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteCancel}
        aria-labelledby="bulk-delete-dialog-title"
        aria-describedby="bulk-delete-dialog-description"
      >
        <DialogTitle id="bulk-delete-dialog-title">
          {t('bankStatement.confirmBulkDelete', 'Confirm Bulk Delete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="bulk-delete-dialog-description">
            {t('bankStatement.bulkDeleteWarning', 'Are you sure you want to delete all records in the group "{{groupName}}"? This will delete {{recordCount}} records and this action cannot be undone.', {
              groupName: groupToDelete,
              recordCount: groupToDelete ? groupedRecords[groupToDelete]?.length || 0 : 0
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkDeleteCancel} disabled={isBulkDeleting}>
            {t('bankStatement.cancel', 'Cancel')}
          </Button>
          <Button 
            onClick={handleBulkDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isBulkDeleting}
          >
            {isBulkDeleting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t('bankStatement.bulkDelete', 'Delete All')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankStatement; 