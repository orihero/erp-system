import React, { useState, useEffect, useCallback } from 'react';
import { TextField, MenuItem, CircularProgress, Typography, Box, Alert, Autocomplete } from '@mui/material';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import { cascadingApi, CascadingConfig } from '@/api/services/cascading';
import { directoriesApi } from '@/api/services/directories';
import type { DirectoryEntry, DirectoryField } from '@/api/services/directories';

interface CascadingSelection {
  fieldName: string;
  value: string;
  displayName: string;
}

// Support both old and new interfaces
interface RelationFieldProps {
  // New interface props
  relationDirectoryId?: string;
  companyId?: string;
  value?: string | undefined;
  onChange?: (value: string, cascadingSelections?: CascadingSelection[]) => void;
  labelFieldId?: string;
  disabled?: boolean;
  required?: boolean;
  currentDirectoryId?: string;
  label?: string;
  showCascading?: boolean;
  
  // Old interface props (for backward compatibility)
  field?: DirectoryField;
}

const RelationField: React.FC<RelationFieldProps> = ({
  // New interface props
  relationDirectoryId: newRelationDirectoryId,
  companyId: newCompanyId,
  value: newValue,
  onChange: newOnChange,
  labelFieldId,
  disabled: newDisabled,
  required: newRequired,
  currentDirectoryId,
  label: newLabel,
  showCascading = true,
  
  // Old interface props
  field,
}) => {
  // Determine which interface to use
  const isNewInterface = !field && newRelationDirectoryId && newCompanyId;
  const isOldInterface = field && !newRelationDirectoryId && !newCompanyId;
  
  // Extract values based on interface
  const relationDirectoryId = isNewInterface ? newRelationDirectoryId! : (isOldInterface ? field!.relation_id! : '');
  const companyId = isNewInterface ? newCompanyId! : (isOldInterface ? 'company-id' : ''); // TODO: Get from context
  const value = isNewInterface ? newValue : (isOldInterface ? String(newValue || '') : '');
  const onChange = isNewInterface ? newOnChange : (isOldInterface ? (val: string) => newOnChange?.(val) : undefined);
  const disabled = isNewInterface ? newDisabled : false;
  const required = isNewInterface ? newRequired : (isOldInterface ? field!.required : false);
  const label = isNewInterface ? newLabel : (isOldInterface ? field!.name : '');

  const [cascadingConfig, setCascadingConfig] = useState<CascadingConfig | null>(null);
  const [cascadingSelections, setCascadingSelections] = useState<CascadingSelection[]>([]);
  const [cascadingLoading, setCascadingLoading] = useState(false);
  const [cascadingError, setCascadingError] = useState<string | null>(null);

  console.log('🔍 RelationField Debug - Props:', {
    relationDirectoryId,
    companyId,
    value,
    labelFieldId,
    disabled,
    required,
    currentDirectoryId,
    label,
    showCascading,
    isNewInterface,
    isOldInterface
  });

  // Initial data load (without search)
  const { data, isLoading, error: hookError } = useDirectoryRecords(relationDirectoryId, companyId);
  
  // Debounced search functionality
  const searchFunction = useCallback(async (searchTerm: string) => {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    const res = await directoriesApi.getFullDirectoryData(relationDirectoryId, companyId, params);
    return res.data;
  }, [relationDirectoryId, companyId]);

  const {
    searchTerm,
    results: searchResults,
    isLoading: isSearching,
    error: searchError,
    search,
    clearSearch,
  } = useDebouncedSearch(searchFunction, { delay: 300, minLength: 2 });

  // Use search results if available, otherwise use initial data
  const effectiveData = searchResults || data;
  const effectiveIsLoading = isSearching || isLoading;
  const effectiveError = searchError || hookError;
  
  console.log('🔍 RelationField Debug - Hook Data:', {
    isLoading: effectiveIsLoading,
    error: effectiveError,
    hasData: !!effectiveData,
    dataKeys: effectiveData ? Object.keys(effectiveData) : null,
    searchTerm,
    hasSearchResults: !!searchResults
  });

  // Use fields from effectiveData.fields (top level) instead of data.directory.fields
  const fields: DirectoryField[] = (effectiveData?.fields || []) as DirectoryField[];
  const records: DirectoryEntry[] = (effectiveData?.directoryRecords || []) as DirectoryEntry[];
  const directoryMetadata = effectiveData?.directory?.metadata || {};

  console.log('🔍 RelationField Debug - Extracted Data:', {
    fieldsCount: fields.length,
    recordsCount: records.length,
    directoryMetadata,
    fields: fields.map(f => ({ id: f.id, name: f.name, metadata: f.metadata })),
    records: records.slice(0, 3).map(r => ({ 
      id: r.id, 
      recordValuesCount: r.recordValues?.length || 0,
      hasValues: !!r.values,
      hasRecordValues: !!r.recordValues
    }))
  });

  const checkCascadingConfig = useCallback(async (selectedValue: string) => {
    try {
      setCascadingLoading(true);
      setCascadingError(null);

      // Find the selected record to get its metadata
      const selectedRecord = records.find(r => r.id === selectedValue);
      if (!selectedRecord) {
        console.log('🔍 RelationField Debug - Selected record not found');
        return;
      }

      // Get the first field as the field ID for cascading check
      const fieldId = fields[0]?.id;
      if (!fieldId) {
        console.log('🔍 RelationField Debug - No field ID available for cascading check');
        return;
      }

      console.log('🔍 RelationField Debug - Checking cascading config for:', {
        directoryId: relationDirectoryId,
        fieldId,
        value: selectedValue
      });

      const response = await cascadingApi.getCascadingConfig(relationDirectoryId, fieldId, selectedValue);
      
      if (response.data.success) {
        const config = response.data.data;
        console.log('🔍 RelationField Debug - Cascading config received:', config);
        
        if (config.enabled && config.dependentFields.length > 0) {
          setCascadingConfig(config);
          console.log('🔍 RelationField Debug - Cascading enabled with fields:', config.dependentFields);
        } else {
          setCascadingConfig(null);
          console.log('🔍 RelationField Debug - Cascading disabled or no dependent fields');
        }
      } else {
        console.log('🔍 RelationField Debug - API returned error:', response.data);
        setCascadingConfig(null);
      }
    } catch (error) {
      console.error('🔍 RelationField Debug - Error checking cascading config:', error);
      setCascadingError('Failed to load cascading configuration');
      setCascadingConfig(null);
    } finally {
      setCascadingLoading(false);
    }
  }, [records, fields, relationDirectoryId]);

  // Check for cascading configuration when a value is selected and records are loaded
  useEffect(() => {
    if (value && showCascading && records.length > 0 && !isLoading) {
      checkCascadingConfig(value);
    } else if (!value) {
      setCascadingConfig(null);
      setCascadingSelections([]);
    }
  }, [value, showCascading, records, isLoading, checkCascadingConfig]);

  // Clear cascading selections when main value changes
  useEffect(() => {
    if (!value) {
      setCascadingSelections([]);
    }
  }, [value]);

  const handleCascadingSelection = (fieldName: string, fieldValue: string, displayName: string) => {
    console.log('🔍 RelationField Debug - Cascading selection:', { fieldName, fieldValue, displayName });
    
    const newSelections = [
      ...cascadingSelections.filter(s => s.fieldName !== fieldName),
      { fieldName, value: fieldValue, displayName }
    ];
    setCascadingSelections(newSelections);
    
    console.log('🔍 RelationField Debug - Updated cascading selections:', newSelections);
    
    // Call onChange with both the main value and cascading selections
    if (onChange) {
      onChange(value!, newSelections);
    }
  };

  // Prevent self-reference (must be after hook call)
  if (!relationDirectoryId || relationDirectoryId === currentDirectoryId) {
    console.log('🔍 RelationField Debug - Self-reference detected:', {
      relationDirectoryId,
      currentDirectoryId
    });
    return <Typography color="text.secondary">Invalid relation</Typography>;
  }

  // Find the best label field
  let labelField: DirectoryField | undefined;
  
  console.log('🔍 RelationField Debug - Starting label field selection...');
  
  // First, check if there's a selectDisplayField in directory metadata
  if (directoryMetadata.selectDisplayField) {
    console.log('🔍 RelationField Debug - Found selectDisplayField in metadata:', directoryMetadata.selectDisplayField);
    
    // Try to find by field ID first
    labelField = fields.find(f => f.id === directoryMetadata.selectDisplayField);
    console.log('🔍 RelationField Debug - Search by ID result:', labelField ? 'Found' : 'Not found');
    
    // If not found by ID, try to find by field name
    if (!labelField) {
      console.log('🔍 RelationField Debug - Trying to find by field name...');
      labelField = fields.find(f => f.name === directoryMetadata.selectDisplayField);
      console.log('🔍 RelationField Debug - Search by name result:', labelField ? 'Found' : 'Not found');
    }
  } else {
    console.log('🔍 RelationField Debug - No selectDisplayField in metadata');
  }
  
  // If no selectDisplayField or field not found, use the provided labelFieldId
  if (!labelField && labelFieldId) {
    console.log('🔍 RelationField Debug - Using provided labelFieldId:', labelFieldId);
    labelField = fields.find(f => f.id === labelFieldId);
    console.log('🔍 RelationField Debug - Found by labelFieldId:', labelField ? 'Yes' : 'No');
  }
  
  // If still no label field, look for a field marked as visible on table
  if (!labelField) {
    console.log('🔍 RelationField Debug - Looking for field with isVisibleOnTable...');
    labelField = fields.find(f => f.metadata?.isVisibleOnTable);
    console.log('🔍 RelationField Debug - Found field with isVisibleOnTable:', labelField ? 'Yes' : 'No');
  }
  
  // Last resort: use the first field
  if (!labelField && fields.length > 0) {
    console.log('🔍 RelationField Debug - Using first field as fallback');
    labelField = fields[0];
  }

  console.log('🔍 RelationField Debug - Final label field:', labelField ? {
    id: labelField.id,
    name: labelField.name,
    metadata: labelField.metadata
  } : 'None');

  // Helper to get label for a record
  const getLabel = (record: DirectoryEntry): string => {
    console.log('🔍 RelationField Debug - getLabel called for record:', {
      recordId: record.id,
      labelField: labelField ? {
        id: labelField.id,
        name: labelField.name,
        type: typeof labelField.id
      } : 'No label field',
      recordValues: record.recordValues?.map(v => ({
        field_id: v.field_id,
        value: v.value,
        field_id_type: typeof v.field_id
      })) || [],
      hasValues: !!record.values,
      hasRecordValues: !!record.recordValues
    });

    // Use recordValues if available, otherwise fall back to values
    const valuesToUse = record.recordValues || record.values;
    
    if (labelField && valuesToUse) {
      let valObj;
      
      if (record.recordValues) {
        // For recordValues structure, since field_id is null, we'll use the first value
        // since there's only one field in this directory
        valObj = record.recordValues[0];
        console.log('🔍 RelationField Debug - Using recordValues, found:', valObj);
      } else if (record.values) {
        // For legacy values structure
        valObj = record.values.find(v => v.attribute_id === labelField.id);
        if (!valObj) {
          valObj = record.values.find(v => String(v.attribute_id) === String(labelField.id));
        }
      }
      
      console.log('🔍 RelationField Debug - getLabel result:', {
        recordId: record.id,
        labelFieldId: labelField.id,
        foundValue: valObj ? { 
          value: valObj.value, 
          type: typeof valObj.value,
          field_id: 'field_id' in valObj ? valObj.field_id : 'N/A'
        } : 'Not found',
        allValues: valuesToUse?.map(v => ({ 
          field_id: 'field_id' in v ? v.field_id : 'N/A',
          attribute_id: 'attribute_id' in v ? v.attribute_id : 'N/A',
          value: v.value,
          field_id_type: typeof ('field_id' in v ? v.field_id : 'N/A')
        })) || []
      });
      
      if (valObj && valObj.value !== undefined && valObj.value !== null) {
        console.log('🔍 RelationField Debug - Returning value:', String(valObj.value));
        return String(valObj.value);
      }
    }
    // Fallback: show record id
    console.log('🔍 RelationField Debug - Using record ID as fallback label:', record.id);
    return record.id;
  };

  if (effectiveIsLoading && !searchResults) {
    console.log('🔍 RelationField Debug - Showing loading state');
    return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={18} /> <Typography>Loading...</Typography></Box>;
  }
  
  if (effectiveError && !searchResults) {
    console.log('🔍 RelationField Debug - Showing error state:', effectiveError);
    return <Typography color="error">Failed to load relation records</Typography>;
  }

  console.log('🔍 RelationField Debug - Rendering final component with:', {
    label: label || labelField?.name || 'Select record',
    value,
    recordsCount: records.length,
    hasRecords: records.length > 0,
    cascadingConfig: cascadingConfig ? 'Enabled' : 'Disabled',
    cascadingSelectionsCount: cascadingSelections.length
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Main Relation Field */}
      <Autocomplete
        fullWidth
        options={records}
        getOptionLabel={(option) => getLabel(option)}
        value={records.find(rec => rec.id === value) || null}
        onChange={(_, newValue) => {
          onChange?.(newValue?.id || '');
          if (!newValue) {
            clearSearch();
          }
        }}
        onInputChange={(_, newInputValue) => {
          if (newInputValue.length >= 2) {
            search(newInputValue);
          } else {
            clearSearch();
          }
        }}
        loading={effectiveIsLoading}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label || labelField?.name || 'Select record'}
            required={required}
                         error={!!effectiveError}
             helperText={effectiveError ? String(effectiveError) : undefined}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {effectiveIsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        noOptionsText={searchTerm ? "No records found" : "Start typing to search..."}
        filterOptions={(x) => x} // Disable client-side filtering since we're using server-side search
      />

      {/* Cascading Fields */}
      {showCascading && value && cascadingConfig && cascadingConfig.enabled && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Additional Options
          </Typography>
          
          {cascadingLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">Loading cascading options...</Typography>
            </Box>
          )}

          {cascadingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cascadingError}
            </Alert>
          )}

                     {cascadingConfig.dependentFields.map((field) => {
             const currentSelection = cascadingSelections.find(s => s.fieldName === field.fieldName);
             return (
               <CascadingRelationField
                 key={field.fieldName}
                 field={field}
                 companyId={companyId}
                 onSelectionChange={handleCascadingSelection}
                 disabled={disabled}
                 currentValue={currentSelection?.value || ''}
               />
             );
           })}
        </Box>
      )}
    </Box>
  );
};

// Cascading Relation Field Component
interface CascadingRelationFieldProps {
  field: {
    fieldName: string;
    directoryId: string;
    displayName: string;
    required: boolean;
    dependsOn?: string;
  };
  companyId: string;
  onSelectionChange: (fieldName: string, value: string, displayName: string) => void;
  disabled?: boolean;
  currentValue?: string;
}

const CascadingRelationField: React.FC<CascadingRelationFieldProps> = ({
  field,
  companyId,
  onSelectionChange,
  disabled,
  currentValue
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(currentValue || '');
  const { data, isLoading, error } = useDirectoryRecords(field.directoryId, companyId);
  
  const records: DirectoryEntry[] = (data?.directoryRecords || []) as DirectoryEntry[];
  const fields: DirectoryField[] = (data?.fields || []) as DirectoryField[];
  const directoryMetadata = data?.directory?.metadata || {};

  // Update selectedValue when currentValue changes
  useEffect(() => {
    setSelectedValue(currentValue || '');
  }, [currentValue]);

  // Find label field for this cascading directory
  let labelField: DirectoryField | undefined;
  
  if (directoryMetadata.selectDisplayField) {
    labelField = fields.find(f => f.id === directoryMetadata.selectDisplayField) ||
                fields.find(f => f.name === directoryMetadata.selectDisplayField);
  }
  
  if (!labelField && fields.length > 0) {
    labelField = fields.find(f => f.metadata?.isVisibleOnTable) || fields[0];
  }

  const getLabel = (record: DirectoryEntry): string => {
    const valuesToUse = record.recordValues || record.values;
    
    if (labelField && valuesToUse) {
      let valObj;
      
      if (record.recordValues) {
        valObj = record.recordValues[0];
      } else if (record.values) {
        valObj = record.values.find(v => v.attribute_id === labelField.id);
        if (!valObj) {
          valObj = record.values.find(v => String(v.attribute_id) === String(labelField.id));
        }
      }
      
      if (valObj && valObj.value !== undefined && valObj.value !== null) {
        return String(valObj.value);
      }
    }
    return record.id;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2">Loading {field.displayName}...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 1 }}>
        Failed to load {field.displayName}
      </Alert>
    );
  }

  return (
    <TextField
      select
      fullWidth
      margin="normal"
      label={field.displayName}
      value={selectedValue}
      onChange={e => {
        const newValue = e.target.value;
        console.log('🔍 CascadingRelationField Debug - onChange triggered:', { 
          fieldName: field.fieldName, 
          newValue, 
          availableRecords: records.length 
        });
        
        setSelectedValue(newValue);
        
        const selectedRecord = records.find(r => r.id === newValue);
        if (selectedRecord) {
          console.log('🔍 CascadingRelationField Debug - Selected record:', selectedRecord);
          onSelectionChange(field.fieldName, selectedRecord.id, getLabel(selectedRecord));
        }
      }}
      required={field.required}
      disabled={disabled}
    >
      <MenuItem value="">Select {field.displayName}...</MenuItem>
      {records.map(rec => (
        <MenuItem key={rec.id} value={rec.id}>{getLabel(rec)}</MenuItem>
      ))}
    </TextField>
  );
};

export default RelationField; 