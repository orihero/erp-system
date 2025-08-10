import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { CascadingConfig, CascadingField } from '@/api/services/cascading';
import { directoriesApi } from '@/api/services/directories';

interface DirectoryField {
  id: string;
  name: string;
  type: string;
  directory_id: string;
  relation_id: string | null;
  metadata?: {
    isVisibleOnTable?: boolean;
    fieldOrder?: number;
    [key: string]: unknown;
  };
}

interface DirectoryRecordValue {
  id: string;
  field_id: string | null;
  value: string | number | boolean;
  field: DirectoryField | null;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface DirectoryRecordApi {
  id: string;
  company_directory_id?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
  recordValues: DirectoryRecordValue[];
}

interface Directory {
  id: string;
  name: string;
  icon_name: string;
  directory_type: string;
  metadata?: Record<string, unknown>;
}

interface DirectoryRecordMetadataEditorProps {
  record: DirectoryRecordApi;
  open: boolean;
  onClose: () => void;
  onSave: (recordId: string, cascadingConfig: CascadingConfig) => Promise<void>;
}

const DirectoryRecordMetadataEditor: React.FC<DirectoryRecordMetadataEditorProps> = ({
  record,
  open,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loadingDirectories, setLoadingDirectories] = useState(false);
  
  // Debug: Log the record when component opens
  useEffect(() => {
    if (open && record) {
      console.log('🔍 DirectoryRecordMetadataEditor Debug - Record passed to component:', record);
      console.log('🔍 DirectoryRecordMetadataEditor Debug - Record metadata:', record.metadata);
    }
  }, [open, record]);
  
  // Cascading configuration state
  const [cascadingConfig, setCascadingConfig] = useState<CascadingConfig>({
    enabled: false,
    dependentFields: []
  });

  // Load directories when component opens
  useEffect(() => {
    if (open) {
      loadDirectories();
      loadExistingCascadingConfig();
    }
  }, [open, record]);

  const loadDirectories = async () => {
    try {
      setLoadingDirectories(true);
      const response = await directoriesApi.getAll();
      setDirectories(response.data);
    } catch (error) {
      console.error('Error loading directories:', error);
      setError('Failed to load directories');
    } finally {
      setLoadingDirectories(false);
    }
  };

  const loadExistingCascadingConfig = () => {
    // Load existing cascading configuration from record metadata
    // The cascading config is stored as cascadingConfig inside the metadata
    const existingConfig = record.metadata?.cascadingConfig as CascadingConfig | undefined;
    
    console.log('🔍 DirectoryRecordMetadataEditor Debug - Record metadata:', record.metadata);
    console.log('🔍 DirectoryRecordMetadataEditor Debug - Existing config:', existingConfig);
    
    if (existingConfig && existingConfig.enabled !== undefined) {
      console.log('Loading existing cascading config:', existingConfig);
      setCascadingConfig({
        enabled: existingConfig.enabled || false,
        dependentFields: existingConfig.dependentFields || []
      });
    } else {
      console.log('No existing cascading config found, using defaults');
      setCascadingConfig({
        enabled: false,
        dependentFields: []
      });
    }
  };

  const handleCascadingToggle = (enabled: boolean) => {
    setCascadingConfig(prev => ({
      ...prev,
      enabled
    }));
  };

  const addDependentField = () => {
    const newField: CascadingField = {
      fieldName: `field_${cascadingConfig.dependentFields.length + 1}`,
      directoryId: '',
      displayName: '',
      required: false,
      dependsOn: undefined
    };

    setCascadingConfig(prev => ({
      ...prev,
      dependentFields: [...prev.dependentFields, newField]
    }));
  };

  const updateDependentField = (index: number, field: Partial<CascadingField>) => {
    setCascadingConfig(prev => ({
      ...prev,
      dependentFields: prev.dependentFields.map((f, i) => 
        i === index ? { ...f, ...field } : f
      )
    }));
  };

  const removeDependentField = (index: number) => {
    setCascadingConfig(prev => ({
      ...prev,
      dependentFields: prev.dependentFields.filter((_, i) => i !== index)
    }));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= cascadingConfig.dependentFields.length) return;

    setCascadingConfig(prev => {
      const newFields = [...prev.dependentFields];
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      return {
        ...prev,
        dependentFields: newFields
      };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await onSave(record.id, cascadingConfig);
      setSuccess(true);
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cascading configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCascadingConfig({
      enabled: false,
      dependentFields: []
    });
    setError(null);
    setSuccess(false);
  };

  const getAvailableParentFields = (currentIndex: number) => {
    return cascadingConfig.dependentFields
      .filter((_, index) => index < currentIndex)
      .map(field => ({
        value: field.fieldName,
        label: field.displayName
      }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon icon="mdi:cog" />
          {t('directories.records.cascadingConfig', 'Cascading Configuration')} - {record.id}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t('directories.records.configSaved', 'Cascading configuration saved successfully!')}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Enable Cascading */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('directories.records.enableCascading', 'Enable Cascading')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('directories.records.cascadingDescription', 'When enabled, selecting this DirectoryRecord will trigger additional dependent fields to appear.')}
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={cascadingConfig.enabled}
                  onChange={(e) => handleCascadingToggle(e.target.checked)}
                />
              }
              label={t('directories.records.enableCascadingFields', 'Enable cascading fields')}
            />
          </Paper>

          {/* Dependent Fields Configuration */}
          {cascadingConfig.enabled && (
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('directories.records.dependentFields', 'Dependent Fields')}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Icon icon="mdi:plus" />}
                  onClick={addDependentField}
                >
                  {t('directories.records.addField', 'Add Field')}
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('directories.records.dependentFieldsDescription', 'Configure fields that will appear when this DirectoryRecord is selected. You can create chains of dependent fields.')}
              </Typography>

              {cascadingConfig.dependentFields.length === 0 ? (
                <Alert severity="info">
                  {t('directories.records.noDependentFields', 'No dependent fields configured. Click "Add Field" to start.')}
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {cascadingConfig.dependentFields.map((field, index) => (
                    <Accordion key={index} defaultExpanded>
                      <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
                        <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%' }}>
                          <Chip 
                            label={`${index + 1}`} 
                            size="small" 
                            color="primary" 
                          />
                          <Typography variant="subtitle1">
                            {field.displayName || t('directories.records.untitledField', 'Untitled Field')}
                          </Typography>
                          {field.required && (
                            <Chip 
                              label={t('common.required', 'Required')} 
                              size="small" 
                              color="error" 
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                              fullWidth
                              label={t('directories.records.fieldName', 'Field Name')}
                              value={field.fieldName}
                              onChange={(e) => updateDependentField(index, { fieldName: e.target.value })}
                              helperText={t('directories.records.fieldNameHelp', 'Internal field name (used in code)')}
                            />
                            
                            <TextField
                              fullWidth
                              label={t('directories.records.displayName', 'Display Name')}
                              value={field.displayName}
                              onChange={(e) => updateDependentField(index, { displayName: e.target.value })}
                              helperText={t('directories.records.displayNameHelp', 'Name shown to users')}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth>
                              <InputLabel>{t('directories.records.directory', 'Directory')}</InputLabel>
                              <Select
                                value={field.directoryId}
                                onChange={(e) => updateDependentField(index, { directoryId: e.target.value })}
                                label={t('directories.records.directory', 'Directory')}
                                disabled={loadingDirectories}
                              >
                                {directories.map((dir) => (
                                  <MenuItem key={dir.id} value={dir.id}>
                                    {dir.name} ({dir.directory_type})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            
                            <FormControl fullWidth>
                              <InputLabel>{t('directories.records.dependsOn', 'Depends On')}</InputLabel>
                              <Select
                                value={field.dependsOn || ''}
                                onChange={(e) => updateDependentField(index, { dependsOn: e.target.value || undefined })}
                                label={t('directories.records.dependsOn', 'Depends On')}
                              >
                                <MenuItem value="">
                                  <em>{t('directories.records.noDependency', 'No dependency')}</em>
                                </MenuItem>
                                {getAvailableParentFields(index).map((parent) => (
                                  <MenuItem key={parent.value} value={parent.value}>
                                    {parent.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                          
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.required}
                                onChange={(e) => updateDependentField(index, { required: e.target.checked })}
                              />
                            }
                            label={t('directories.records.required', 'Required field')}
                          />
                        </Box>
                        
                        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                          <IconButton
                            size="small"
                            onClick={() => moveField(index, 'up')}
                            disabled={index === 0}
                          >
                            <Icon icon="mdi:arrow-up" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => moveField(index, 'down')}
                            disabled={index === cascadingConfig.dependentFields.length - 1}
                          >
                            <Icon icon="mdi:arrow-down" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeDependentField(index)}
                          >
                            <Icon icon="mdi:delete" />
                          </IconButton>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Paper>
          )}

          {/* Example Configuration */}
          {cascadingConfig.enabled && cascadingConfig.dependentFields.length > 0 && (
            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                {t('directories.records.exampleFlow', 'Example Flow')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('directories.records.exampleFlowDescription', 'When this DirectoryRecord is selected, the following fields will appear in sequence:')}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {cascadingConfig.dependentFields.map((field, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1}>
                    <Chip label={`${index + 1}`} size="small" />
                    <Typography variant="body2">
                      {field.displayName || field.fieldName}
                    </Typography>
                    {field.dependsOn && (
                      <>
                        <Icon icon="mdi:arrow-right" />
                        <Typography variant="caption" color="text.secondary">
                          {t('directories.records.dependsOn', 'depends on')} {field.dependsOn}
                        </Typography>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset} disabled={loading}>
          {t('common.reset', 'Reset')}
        </Button>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Icon icon="mdi:content-save" />}
        >
          {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DirectoryRecordMetadataEditor; 