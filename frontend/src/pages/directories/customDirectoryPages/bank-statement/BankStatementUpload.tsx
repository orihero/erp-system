import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  recordsCount?: number;
  error?: string;
}

interface BankStatementUploadProps {
  onUploadComplete?: () => void;
}

const BankStatementUpload: React.FC<BankStatementUploadProps> = ({ onUploadComplete }) => {
  const { directoryId } = useParams<{ directoryId: string }>();
  const companyId = useSelector((state: RootState) => state.auth.user?.company_id);
  const { t } = useTranslation();
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const {
    refetch
  } = useDirectoryRecords(directoryId || '', companyId || '');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!directoryId || !companyId) {
      setUploadError('Directory or company not found');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    for (const file of acceptedFiles) {
      const fileId = `${Date.now()}-${Math.random()}`;
      
      // Add file to upload list
      const newFile: UploadedFile = {
        id: fileId,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        status: 'uploading'
      };

      setUploadedFiles(prev => [newFile, ...prev]);

      try {
        // Parse Excel file and extract data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('directoryId', directoryId);
        formData.append('companyId', companyId);

        // Upload and parse the file
        const response = await fetch('/api/file-parser/parse-bank-statement', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();

        // Update file status
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'completed', recordsCount: result.recordsCount }
            : f
        ));

        // Refresh the directory records
        await refetch();
        onUploadComplete?.();

      } catch (error) {
        console.error('Upload error:', error);
        
        // Update file status to error
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ));
        
        setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
      }
    }

    setIsUploading(false);
  }, [directoryId, companyId, refetch, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: true,
    disabled: isUploading
  });

  const handleDeleteFile = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileToDelete));
      setFileToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <CircularProgress size={20} />;
      case 'processing':
        return <CircularProgress size={20} />;
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        {t('bankStatement.upload.title', 'Upload Bank Statement Files')}
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
                <Typography variant="h6" color="primary">
                  {t('bankStatement.upload.processing', 'Processing files...')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('bankStatement.upload.pleaseWait', 'Please wait while we process your files')}
                </Typography>
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive 
                    ? t('bankStatement.upload.dropHere', 'Drop the files here') 
                    : t('bankStatement.upload.dragDrop', 'Drag and drop files here, or click to select')
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {t('bankStatement.upload.supportedFormats', 'Supported formats: .xlsx, .xls (Max 10MB each)')}
                </Typography>
                <Button variant="outlined" color="primary">
                  {t('bankStatement.upload.chooseFiles', 'Choose Files')}
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {uploadError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('bankStatement.upload.uploadedFiles', 'Uploaded Files')}
            </Typography>
            <List>
              {uploadedFiles.map((file) => (
                <ListItem key={file.id} divider>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    {getStatusIcon(file.status)}
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {file.fileName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}
                        {file.recordsCount && ` • ${file.recordsCount} records`}
                      </Typography>
                      {file.error && (
                        <Typography variant="body2" color="error">
                          {file.error}
                        </Typography>
                      )}
                    </Box>
                                         <Chip 
                       label={t(`bankStatement.upload.status.${file.status}`, file.status)} 
                       color={getStatusColor(file.status) as 'warning' | 'success' | 'error' | 'default'}
                       size="small"
                       sx={{ mr: 2 }}
                     />
                  </Box>
                  <ListItemSecondaryAction>
                    <Tooltip title={t('bankStatement.upload.delete', 'Delete file')}>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDeleteFile(file.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>
          {t('bankStatement.upload.confirmDelete', 'Confirm Delete')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('bankStatement.upload.deleteWarning', 'Are you sure you want to delete this file? This action cannot be undone.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t('common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankStatementUpload; 