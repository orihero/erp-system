import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { directoriesApi } from '@/api/services/directories';

interface DirectoryField {
  id: string;
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
}

interface DirectoryMetadataEditorProps {
  directoryId?: string;
  companyDirectoryId?: string; // Will be used for company-specific metadata in the future
  fields: DirectoryField[];
  metadata: Record<string, unknown>;
  onSuccess: () => void;
}

const DirectoryMetadataEditor: React.FC<DirectoryMetadataEditorProps> = ({
  directoryId,
  companyDirectoryId, // Will be used for company-specific metadata in the future
  fields,
  metadata,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Local state for metadata editing
  const [localMetadata, setLocalMetadata] = useState<Record<string, unknown>>(metadata);
  const [fieldMetadata, setFieldMetadata] = useState<Record<string, Record<string, unknown>>>(
    fields.reduce((acc, field) => {
      acc[field.id] = field.metadata || {};
      return acc;
    }, {} as Record<string, Record<string, unknown>>)
  );

  const handleMetadataChange = (key: string, value: unknown) => {
    setLocalMetadata(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFieldMetadataChange = (fieldId: string, key: string, value: unknown) => {
    setFieldMetadata(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!directoryId) {
      setError('Directory ID is required');
      return;
    }

    // Log for debugging (companyDirectoryId will be used in the future)
    console.log('Saving metadata for directory:', directoryId, 'company directory:', companyDirectoryId);

    setLoading(true);
    setError(null);
    
    try {
      await directoriesApi.updateDirectoryMetadata(directoryId, {
        directoryMetadata: localMetadata,
        fieldMetadata
      });
      
      setSuccess(true);
      onSuccess();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLocalMetadata(metadata);
    setFieldMetadata(
      fields.reduce((acc, field) => {
        acc[field.id] = field.metadata || {};
        return acc;
      }, {} as Record<string, Record<string, unknown>>)
    );
    setError(null);
    setSuccess(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('directories.metadata.title', 'Directory Metadata Editor')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('directories.metadata.description', 'Edit directory and field metadata. Changes will affect how the directory is displayed and behaves.')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t('directories.metadata.saved', 'Metadata saved successfully!')}
          </Alert>
        )}

        {/* Directory Metadata */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('directories.metadata.directory', 'Directory Metadata')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label={t('directories.metadata.componentName', 'Component Name')}
            value={localMetadata.componentName as string || ''}
            onChange={(e) => handleMetadataChange('componentName', e.target.value)}
            helperText={t('directories.metadata.componentNameHelp', 'Custom component to render for this directory')}
          />
          <TextField
            fullWidth
            label={t('directories.metadata.displayName', 'Display Name')}
            value={localMetadata.displayName as string || ''}
            onChange={(e) => handleMetadataChange('displayName', e.target.value)}
            helperText={t('directories.metadata.displayNameHelp', 'Human-readable name for the directory')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={localMetadata.isVisible as boolean || false}
                onChange={(e) => handleMetadataChange('isVisible', e.target.checked)}
              />
            }
            label={t('directories.metadata.isVisible', 'Visible in Navigation')}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Field Metadata */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('directories.metadata.fields', 'Field Metadata')}
        </Typography>

        {fields.map((field) => (
          <Paper key={field.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {field.name} ({field.type})
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label={t('directories.metadata.fieldOrder', 'Field Order')}
                type="number"
                value={fieldMetadata[field.id]?.fieldOrder as number || 0}
                onChange={(e) => handleFieldMetadataChange(field.id, 'fieldOrder', parseInt(e.target.value) || 0)}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={fieldMetadata[field.id]?.isVisibleOnTable as boolean || false}
                    onChange={(e) => handleFieldMetadataChange(field.id, 'isVisibleOnTable', e.target.checked)}
                  />
                }
                label={t('directories.metadata.isVisibleOnTable', 'Visible in Table')}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={fieldMetadata[field.id]?.isRequired as boolean || false}
                    onChange={(e) => handleFieldMetadataChange(field.id, 'isRequired', e.target.checked)}
                  />
                }
                label={t('directories.metadata.isRequired', 'Required Field')}
              />
              <TextField
                fullWidth
                size="small"
                label={t('directories.metadata.defaultValue', 'Default Value')}
                value={fieldMetadata[field.id]?.defaultValue as string || ''}
                onChange={(e) => handleFieldMetadataChange(field.id, 'defaultValue', e.target.value)}
              />
            </Box>
          </Paper>
        ))}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
          >
            {t('common.reset', 'Reset')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Icon icon="mdi:content-save" />}
          >
            {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DirectoryMetadataEditor; 