import React, { useState, useCallback } from 'react';
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
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { fileParserService } from '@/api/services/fileParser.service';
import { useTranslation } from 'react-i18next';

interface BankStatementGroup {
  fileName: string;
  recordCount: number;
  totalDebit: number;
  totalCredit: number;
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
}

interface BankStatementUploadProps {
  onViewRecords: (fileName: string, records: any[]) => void; // Added records parameter
}

const BankStatementUpload: React.FC<BankStatementUploadProps> = ({ onViewRecords }) => {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState<BankStatementGroup[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  // Bank statement parsing prompt
  const BANK_STATEMENT_PROMPT = `
Parse this bank statement Excel file and convert it to a standardized JSON format.

The data should be mapped to these exact field names:
- documentDate: Date in YYYY-MM-DD format
- account: Bank account number as string
- organizationName: Organization/company name as string
- documentNumber: Document number as integer
- documentType: Document type code as integer
- branch: Branch code as integer
- debitTurnover: Debit amount as decimal number (0 if empty)
- creditTurnover: Credit amount as decimal number (0 if empty)
- paymentPurpose: Payment description/purpose as string
- cashSymbol: Cash symbol code as integer (null if empty)
- taxId: Tax identification number as string

Rules:
1. Convert all dates to YYYY-MM-DD format
2. Convert numeric fields to appropriate types (integer/decimal)
3. Handle empty/null values appropriately
4. Preserve all text content in original language
5. If a field is missing or empty, use appropriate default values (0 for numbers, null for optional fields, empty string for required strings)
`;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fileParserService.parseExcelFile(file, BANK_STATEMENT_PROMPT);
      
      // Calculate totals
      const totalDebit = response.records.reduce((sum, record) => 
        sum + (parseFloat(record.debitTurnover) || 0), 0);
      const totalCredit = response.records.reduce((sum, record) => 
        sum + (parseFloat(record.creditTurnover) || 0), 0);

      const newGroup: BankStatementGroup = {
        fileName: response.fileName,
        recordCount: response.recordsCount,
        totalDebit,
        totalCredit,
        uploadDate: new Date().toISOString(),
        status: 'completed'
      };

      setUploadedFiles(prev => [newGroup, ...prev]);
      
      // Automatically open the edit view for the uploaded file
      onViewRecords(response.fileName, response.records);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }, [onViewRecords]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isUploading
  });

  const handleDeleteFile = (fileName: string) => {
    setFileToDelete(fileName);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      setUploadedFiles(prev => prev.filter(file => file.fileName !== fileToDelete));
      setFileToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        {t('bankStatement.management', 'Bank Statement Management')}
      </Typography>

      {/* Upload Area */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              bgcolor: isDragActive ? 'primary.50' : 'grey.50',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50'
              }
            }}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <Box>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {t('bankStatement.processing', 'Processing bank statement...')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('bankStatement.parsing', 'AI is parsing your Excel file')}
                </Typography>
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? t('bankStatement.dropHere', 'Drop the file here') : t('bankStatement.upload', 'Upload Bank Statement')}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {t('bankStatement.dragDrop', 'Drag and drop an Excel file here, or click to select')}
                </Typography>
                <Button variant="contained" component="span" disabled={isUploading}>
                  {t('bankStatement.chooseFile', 'Choose File')}
                </Button>
                <Typography variant="caption" display="block" mt={1} color="text.secondary">
                  {t('bankStatement.supportedFormats', 'Supported formats: .xlsx, .xls (Max 10MB)')}
                </Typography>
              </Box>
            )}
          </Box>

          {uploadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {uploadError}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files Table */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('bankStatement.uploaded', 'Uploaded Bank Statements')}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell align="center">Records</TableCell>
                    <TableCell align="right">Total Debit</TableCell>
                    <TableCell align="right">Total Credit</TableCell>
                    <TableCell align="center">Upload Date</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadedFiles.map((file) => (
                    <TableRow key={file.fileName} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {file.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={file.recordCount} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          {formatCurrency(file.totalDebit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(file.totalCredit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(file.uploadDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={file.status} 
                          size="small"
                          color={
                            file.status === 'completed' ? 'success' :
                            file.status === 'processing' ? 'warning' :
                            file.status === 'error' ? 'error' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View/Edit Records">
                          <IconButton 
                            size="small" 
                            onClick={() => onViewRecords(file.fileName, [])} // Pass empty array for now
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small" color="secondary">
                            <FileDownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteFile(file.fileName)}
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
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t('bankStatement.confirmDelete', 'Confirm Delete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('bankStatement.deleteWarningFile', { file: fileToDelete })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t('common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankStatementUpload; 