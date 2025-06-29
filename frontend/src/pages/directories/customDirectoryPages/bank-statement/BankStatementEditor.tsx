import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Tooltip,
  Toolbar,
  AppBar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface BankStatementRecord {
  id?: string;
  fileName: string;
  documentDate: string;
  account: string;
  organizationName: string;
  documentNumber: number;
  documentType: number;
  branch: number;
  debitTurnover: number;
  creditTurnover: number;
  paymentPurpose: string;
  cashSymbol?: number;
  taxId: string;
}

interface BankStatementEditorProps {
  fileName: string;
  records: BankStatementRecord[];
  onBack: () => void;
  onSave: (records: BankStatementRecord[]) => void;
}

const BankStatementEditor: React.FC<BankStatementEditorProps> = ({
  fileName,
  records: initialRecords,
  onBack,
  onSave
}) => {
  const [records, setRecords] = useState<BankStatementRecord[]>(initialRecords);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string | number | Date>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  // Field definitions for the bank statement
  const fieldDefinitions = [
    { key: 'documentDate', label: 'Document Date', type: 'date', width: 120 },
    { key: 'account', label: 'Account', type: 'text', width: 180 },
    { key: 'organizationName', label: 'Organization', type: 'text', width: 200 },
    { key: 'documentNumber', label: 'Doc Number', type: 'number', width: 100 },
    { key: 'documentType', label: 'Doc Type', type: 'number', width: 90 },
    { key: 'branch', label: 'Branch', type: 'number', width: 80 },
    { key: 'debitTurnover', label: 'Debit', type: 'decimal', width: 120 },
    { key: 'creditTurnover', label: 'Credit', type: 'decimal', width: 120 },
    { key: 'paymentPurpose', label: 'Payment Purpose', type: 'text', width: 300 },
    { key: 'cashSymbol', label: 'Cash Symbol', type: 'number', width: 100 },
    { key: 'taxId', label: 'Tax ID', type: 'text', width: 120 }
  ];

  const handleCellClick = (rowIndex: number, field: string) => {
    if (field === 'fileName') return; // Don't allow editing fileName
    
    setEditingCell({ rowIndex, field });
    setEditValue(records[rowIndex][field as keyof BankStatementRecord] ?? '');
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const { rowIndex, field } = editingCell;
    const newRecords = [...records];
    
    // Type conversion based on field type
    const fieldDef = fieldDefinitions.find(f => f.key === field);
    let processedValue = editValue;
    
    if (fieldDef?.type === 'number' || fieldDef?.type === 'decimal') {
      processedValue = parseFloat(editValue.toString()) || 0;
    } else if (fieldDef?.type === 'date') {
      processedValue = editValue instanceof Date ? 
        editValue.toISOString().split('T')[0] : editValue;
    }

    newRecords[rowIndex] = {
      ...newRecords[rowIndex],
      [field]: processedValue
    };

    setRecords(newRecords);
    setEditingCell(null);
    setEditValue('');
    setHasChanges(true);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleAddRecord = () => {
    const newRecord: BankStatementRecord = {
      fileName,
      documentDate: new Date().toISOString().split('T')[0],
      account: '',
      organizationName: '',
      documentNumber: 0,
      documentType: 0,
      branch: 0,
      debitTurnover: 0,
      creditTurnover: 0,
      paymentPurpose: '',
      cashSymbol: 0,
      taxId: ''
    };

    setRecords([...records, newRecord]);
    setHasChanges(true);
  };

  const handleDeleteRecord = (index: number) => {
    setRecordToDelete(index);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete !== null) {
      const newRecords = records.filter((_, index) => index !== recordToDelete);
      setRecords(newRecords);
      setHasChanges(true);
      setRecordToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleSave = async () => {
    try {
      await onSave(records);
      setHasChanges(false);
      setSaveError(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save records');
    }
  };

  const renderCell = (record: BankStatementRecord, field: string, rowIndex: number) => {
    const fieldDef = fieldDefinitions.find(f => f.key === field);
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    const value = record[field as keyof BankStatementRecord];

    if (isEditing) {
      if (fieldDef?.type === 'date') {
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DatePicker
                value={editValue instanceof Date ? editValue : new Date(editValue)}
                onChange={(newValue: Date | null) => setEditValue(newValue ?? '')}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 120 }
                  }
                }}
              />
              <IconButton size="small" onClick={handleCellSave} color="primary">
                <CheckIcon />
              </IconButton>
              <IconButton size="small" onClick={handleCellCancel}>
                <CloseIcon />
              </IconButton>
            </Box>
          </LocalizationProvider>
        );
      }

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            size="small"
            type={fieldDef?.type === 'number' || fieldDef?.type === 'decimal' ? 'number' : 'text'}
            autoFocus
            sx={{ minWidth: 100 }}
          />
          <IconButton size="small" onClick={handleCellSave} color="primary">
            <CheckIcon />
          </IconButton>
          <IconButton size="small" onClick={handleCellCancel}>
            <CloseIcon />
          </IconButton>
        </Box>
      );
    }

    // Display value
    let displayValue = value;
    if (fieldDef?.type === 'decimal' && typeof value === 'number') {
      displayValue = new Intl.NumberFormat('uz-UZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } else if (fieldDef?.type === 'date' && value) {
      displayValue = new Date(value as string).toLocaleDateString('uz-UZ');
    }

    return (
      <Box
        onClick={() => handleCellClick(rowIndex, field)}
        sx={{
          cursor: field === 'fileName' ? 'default' : 'pointer',
          p: 1,
          borderRadius: 1,
          '&:hover': field !== 'fileName' ? {
            bgcolor: 'action.hover'
          } : {},
          minHeight: 40,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {field === 'fileName' ? (
          <Chip label={displayValue} size="small" color="primary" />
        ) : (
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {displayValue || '-'}
          </Typography>
        )}
      </Box>
    );
  };

  const totals = useMemo(() => {
    return records.reduce(
      (acc, record) => ({
        debit: acc.debit + (record.debitTurnover || 0),
        credit: acc.credit + (record.creditTurnover || 0)
      }),
      { debit: 0, credit: 0 }
    );
  }, [records]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Edit Bank Statement: {fileName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddRecord}
            >
              Add Record
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!hasChanges}
              color={hasChanges ? 'primary' : 'inherit'}
            >
              Save Changes
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        {hasChanges && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You have unsaved changes. Don't forget to save!
          </Alert>
        )}

        {/* Summary */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>Records:</strong> {records.length}
              </Typography>
              <Typography variant="body2" color="error.main">
                <strong>Total Debit:</strong> {new Intl.NumberFormat('uz-UZ', {
                  style: 'currency',
                  currency: 'UZS',
                  minimumFractionDigits: 0
                }).format(totals.debit)}
              </Typography>
              <Typography variant="body2" color="success.main">
                <strong>Total Credit:</strong> {new Intl.NumberFormat('uz-UZ', {
                  style: 'currency',
                  currency: 'UZS',
                  minimumFractionDigits: 0
                }).format(totals.credit)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Table */}
        <Card sx={{ flex: 1, overflow: 'hidden' }}>
          <TableContainer sx={{ height: '100%' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={50}>#</TableCell>
                  {fieldDefinitions.map((field) => (
                    <TableCell key={field.key} width={field.width}>
                      {field.label}
                    </TableCell>
                  ))}
                  <TableCell width={80} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{index + 1}</TableCell>
                    {fieldDefinitions.map((field) => (
                      <TableCell key={field.key}>
                        {renderCell(record, field.key, index)}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Tooltip title="Delete Record">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRecord(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankStatementEditor; 