import React, { useState, useEffect } from 'react';
import { Box, Button, Drawer, Typography, TextField, Divider, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { RootState } from '@/store';
import { fetchDirectoryFieldsStart } from '@/store/slices/directoriesSlice';
import { updateDirectoryRecord } from '@/store/slices/directoryRecordsSlice';
import RelationField from '@/components/RelationField';

interface DirectoryField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  relation_id: string | null;
  metadata?: Record<string, unknown>;
}

interface DirectoryRecordApi {
  id: string;
  company_directory_id?: string;
  createdAt?: string;
  updatedAt?: string;
  recordValues: Array<{
    id: string;
    field_id: string | null;
    value: string | number | boolean;
    field: DirectoryField | null;
    metadata?: Record<string, unknown>;
  }>;
}

interface EditDirectoryRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  record: DirectoryRecordApi | null;
  companyDirectoryId: string | undefined;
  directoryId?: string;
  onSuccess?: () => void;
}

const EditDirectoryRecordDrawer: React.FC<EditDirectoryRecordDrawerProps> = ({
  open,
  onClose,
  record,
  companyDirectoryId,
  directoryId,
  onSuccess
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { fields, fieldsLoading } = useSelector((state: RootState) => state.directories);
  const { updating, updateError } = useSelector((state: RootState) => state.directoryRecords);
  const fieldId = directoryId || companyDirectoryId;
  const loading = fieldId ? fieldsLoading[fieldId] || false : false;
  const directoryFields = fieldId ? fields[fieldId] || [] : [];
  
  console.log('EditDirectoryRecordDrawer - Current state:', {
    fieldId,
    loading,
    directoryFields,
    fieldsLoading,
    fields
  });
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && fieldId) {
      console.log('EditDirectoryRecordDrawer - Fetching fields for fieldId:', fieldId);
      dispatch(fetchDirectoryFieldsStart(fieldId));
    }
  }, [open, fieldId, dispatch]);

  useEffect(() => {
    if (record && directoryFields.length > 0) {
      const initialData: Record<string, string | number | boolean> = {};
      
      console.log('EditDirectoryRecordDrawer Debug:', {
        record,
        directoryFields,
        recordValues: record.recordValues
      });
      
      // Initialize form data from record values
      record.recordValues.forEach((value) => {
        console.log('Processing value:', value);
        if (value.field_id) {
          initialData[value.field_id] = value.value;
          console.log(`Set ${value.field_id} = ${value.value}`);
        } else {
          console.log('Skipping value with null field_id:', value);
        }
      });

      // Handle cases where field_id might be null (system directories or single field cases)
      if (directoryFields.length === 1 && record.recordValues.length === 1) {
        const singleValue = record.recordValues[0];
        const singleField = directoryFields[0];
        if (singleValue && singleField) {
          initialData[singleField.id] = singleValue.value;
          console.log(`Set single field ${singleField.id} = ${singleValue.value}`);
        }
      }

      // Alternative approach: try to match by field name if field_id is null
      if (record.recordValues.some(v => v.field_id === null)) {
        record.recordValues.forEach((value) => {
          if (value.field_id === null && value.field) {
            // Try to find matching field by name
            const matchingField = directoryFields.find(f => f.name === value.field?.name);
            if (matchingField) {
              initialData[matchingField.id] = value.value;
              console.log(`Matched by name: ${matchingField.name} (${matchingField.id}) = ${value.value}`);
            }
          }
        });
      }

      // Additional approach: try to match by field name for all values if field_id doesn't match
      record.recordValues.forEach((value) => {
        if (value.field_id && !initialData[value.field_id] && value.field) {
          // If the field_id doesn't exist in our fields, try to match by name
          const matchingField = directoryFields.find(f => f.name === value.field?.name);
          if (matchingField) {
            initialData[matchingField.id] = value.value;
            console.log(`Matched by name (fallback): ${matchingField.name} (${matchingField.id}) = ${value.value}`);
          }
        }
      });

      // Set default values for fields that don't have values
      directoryFields.forEach((field) => {
        if (!(field.id in initialData)) {
          initialData[field.id] = '';
          console.log(`Set default for ${field.id} = ''`);
        }
      });

      console.log('Final initialData:', initialData);
      setFormData(initialData);
      setErrors({});
    }
  }, [record, directoryFields]);

  const handleInputChange = (fieldId: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    directoryFields.forEach((field) => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        newErrors[field.id] = `${field.name} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!record || !companyDirectoryId) return;

    if (!validateForm()) {
      return;
    }

    const values = directoryFields.map(field => ({
      field_id: field.id,
      value: formData[field.id] || ''
    }));

    try {
      dispatch(updateDirectoryRecord({
        companyDirectoryId,
        recordId: record.id,
        values
      }));
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const renderField = (field: DirectoryField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'relation':
        return (
          <RelationField
            key={field.id}
            field={field}
            value={value}
            onChange={(newValue) => handleInputChange(field.id, newValue)}
            error={error}
          />
        );
      case 'date':
        return (
          <TextField
            key={field.id}
            label={field.name}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error}
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'number':
        return (
          <TextField
            key={field.id}
            label={field.name}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error}
          />
        );
      case 'boolean':
        return (
          <TextField
            key={field.id}
            label={field.name}
            select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value === 'true')}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error}
            SelectProps={{ native: true }}
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </TextField>
        );
      default:
        return (
          <TextField
            key={field.id}
            label={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            fullWidth
            required={field.required}
            error={!!error}
            helperText={error}
          />
        );
    }
  };

  const isUpdating = record ? updating[record.id] : false;
  const updateErrorMessage = record ? updateError[record.id] : null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            {t('directories.records.editRecord', 'Edit Record')}
          </Typography>
          <IconButton onClick={onClose} sx={{ minWidth: 'auto' }}>
            <Icon icon="ph:x" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {!companyDirectoryId ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Directory Not Enabled
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              This directory is not enabled for your company.
            </Typography>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999 }}>
              Close
            </Button>
          </Box>
        ) : loading ? (
          <Typography>Loading fields...</Typography>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {directoryFields.map(renderField)}
            </Box>

            {updateErrorMessage && (
              <Typography color="error" sx={{ mb: 2 }}>
                {updateErrorMessage}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={onClose}
                variant="outlined"
                fullWidth
                sx={{ borderRadius: 999 }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isUpdating}
                sx={{ borderRadius: 999 }}
              >
                {isUpdating ? t('common.saving') : t('common.saveChanges')}
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </Drawer>
  );
};

export default EditDirectoryRecordDrawer; 