import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { cascadingApi, CascadingConfig, CascadingField, FilteredRecord } from '@/api/services/cascading';
import { useTranslationWithFallback } from '@/hooks/useTranslationWithFallback';

export interface CascadingSelection {
  fieldName: string;
  value: string;
  displayName: string;
}

interface CascadingFieldSelectorProps {
  directoryId: string;
  fieldId: string;
  initialValue?: string;
  onSelectionChange: (selections: CascadingSelection[]) => void;
  disabled?: boolean;
  label?: string;
  error?: boolean;
  helperText?: string;
}

const CascadingFieldSelector: React.FC<CascadingFieldSelectorProps> = ({
  directoryId,
  fieldId,
  initialValue,
  onSelectionChange,
  disabled = false,
  label,
  error = false,
  helperText
}) => {
  const { tWithFallback } = useTranslationWithFallback();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cascadingConfig, setCascadingConfig] = useState<CascadingConfig | null>(null);
  const [selections, setSelections] = useState<CascadingSelection[]>([]);
  const [availableOptions, setAvailableOptions] = useState<Record<string, FilteredRecord[]>>({});

  // Load cascading configuration when component mounts or when initialValue changes
  useEffect(() => {
    if (initialValue) {
      loadCascadingConfig(initialValue);
    }
  }, [initialValue, directoryId, fieldId]);

  const loadCascadingConfig = useCallback(async (value: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await cascadingApi.getCascadingConfig(directoryId, fieldId, value);
      
      if (response.data.success) {
        setCascadingConfig(response.data.data);
        
        // If cascading is enabled, load options for the first dependent field
        if (response.data.data.enabled && response.data.data.dependentFields.length > 0) {
          const firstField = response.data.data.dependentFields[0];
          await loadFieldOptions(firstField.fieldName, firstField.directoryId);
        }
      }
    } catch (error) {
      console.error('Error loading cascading config:', error);
      setErrorMessage('Failed to load cascading configuration');
    } finally {
      setLoading(false);
    }
  }, [directoryId, fieldId]);

  const loadFieldOptions = useCallback(async (fieldName: string, directoryId: string, parentField?: string, parentValue?: string) => {
    try {
      const response = await cascadingApi.getFilteredRecords(directoryId, parentField, parentValue);
      
      if (response.data.success) {
        setAvailableOptions(prev => ({
          ...prev,
          [fieldName]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error loading field options:', error);
      setErrorMessage(`Failed to load options for ${fieldName}`);
    }
  }, []);

  const handleFieldSelection = useCallback(async (fieldName: string, value: string, displayName: string) => {
    const newSelections = [...selections.filter(s => s.fieldName !== fieldName), { fieldName, value, displayName }];
    setSelections(newSelections);
    onSelectionChange(newSelections);

    // Find the dependent field that depends on this field
    if (cascadingConfig) {
      const dependentField = cascadingConfig.dependentFields.find(field => field.dependsOn === fieldName);
      
      if (dependentField) {
        // Clear subsequent selections
        setSelections(prev => prev.filter(s => !cascadingConfig.dependentFields.find(f => f.fieldName === s.fieldName && f.dependsOn === fieldName)));
        
        // Load options for the dependent field
        await loadFieldOptions(dependentField.fieldName, dependentField.directoryId, fieldName, value);
      }
    }
  }, [selections, cascadingConfig, onSelectionChange, loadFieldOptions]);

  const renderField = (field: CascadingField) => {
    const options = availableOptions[field.fieldName] || [];
    const currentSelection = selections.find(s => s.fieldName === field.fieldName);

    return (
      <FormControl key={field.fieldName} fullWidth error={error} required={field.required}>
        <InputLabel>{field.displayName}</InputLabel>
        <Select
          value={currentSelection?.value || ''}
          onChange={(e) => {
            const selectedOption = options.find(opt => opt.value === e.target.value);
            if (selectedOption) {
              handleFieldSelection(field.fieldName, selectedOption.value, selectedOption.name);
            }
          }}
          disabled={disabled || loading}
          label={field.displayName}
        >
          <MenuItem value="">
            <em>{tWithFallback('cascading.selectOption', 'Select an option')}</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.id} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
        {field.required && !currentSelection && (
          <FormHelperText>{tWithFallback('cascading.fieldRequired', 'This field is required')}</FormHelperText>
        )}
      </FormControl>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" ml={1}>
          {tWithFallback('cascading.loading', 'Loading options...')}
        </Typography>
      </Box>
    );
  }

  if (errorMessage) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorMessage}
      </Alert>
    );
  }

  if (!cascadingConfig || !cascadingConfig.enabled) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {label && (
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
      )}
      
      {cascadingConfig.dependentFields.map((field) => {
        // Only show fields that don't depend on anything or whose parent has been selected
        const shouldShow = !field.dependsOn || selections.some(s => s.fieldName === field.dependsOn);
        
        if (!shouldShow) return null;
        
        return (
          <Box key={field.fieldName}>
            {renderField(field)}
          </Box>
        );
      })}
      
      {helperText && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default CascadingFieldSelector; 