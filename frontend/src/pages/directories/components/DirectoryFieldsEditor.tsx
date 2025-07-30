import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  Paper,
  Divider,
  Tooltip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { DirectoryField, Directory } from '@/api/services/directories';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchDirectoriesStart } from '@/store/slices/directoriesSlice';
import DirectoryFieldMetadataEditor from './DirectoryFieldMetadataEditor';
import { KeyValueObject } from '@/components/KeyValueEditor';

interface DirectoryFieldsEditorProps {
  fields: DirectoryField[];
  onFieldsChange: (fields: DirectoryField[]) => void;
  currentDirectoryId?: string;
}

const DirectoryFieldsEditor: React.FC<DirectoryFieldsEditorProps> = ({
  fields,
  onFieldsChange,
  currentDirectoryId,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { directories } = useSelector((state: RootState) => state.directories);
  const [newField, setNewField] = useState<Partial<DirectoryField>>({
    name: '',
    type: 'string',
  });
  const [metadataEditorOpen, setMetadataEditorOpen] = useState(false);
  const [selectedFieldForMetadata, setSelectedFieldForMetadata] = useState<DirectoryField | null>(null);

  useEffect(() => {
    dispatch(fetchDirectoriesStart());
  }, [dispatch]);

  const fieldTypes = [
    { value: 'string', label: t('directories.fieldTypes.string') },
    { value: 'number', label: t('directories.fieldTypes.number') },
    { value: 'file', label: t('directories.fieldTypes.file') },
    { value: 'bool', label: t('directories.fieldTypes.bool') },
    { value: 'date', label: t('directories.fieldTypes.date') },
    { value: 'time', label: t('directories.fieldTypes.time') },
    { value: 'json', label: t('directories.fieldTypes.json') },
    { value: 'datetime', label: t('directories.fieldTypes.datetime') },
    { value: 'relation', label: t('directories.fieldTypes.relation') },
    { value: 'text', label: t('directories.fieldTypes.text') },
    { value: 'decimal', label: t('directories.fieldTypes.decimal') },
    { value: 'integer', label: t('directories.fieldTypes.integer') },
  ];

  const handleAddField = () => {
    if (newField.name) {
      const field: DirectoryField = {
        id: crypto.randomUUID(),
        directory_id: '',
        name: newField.name,
        type: newField.type || 'string',
        required: false,
        relation_id: newField.type === 'relation' ? newField.relation_id : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onFieldsChange([...fields, field]);
      setNewField({ name: '', type: 'string' });
    }
  };

  const handleRemoveField = (fieldId: string) => {
    onFieldsChange(fields.filter(field => field.id !== fieldId));
  };

  const handleFieldChange = (fieldId: string, changes: Partial<DirectoryField>) => {
    onFieldsChange(fields.map(field => 
      field.id === fieldId ? { ...field, ...changes } : field
    ));
  };

  const handleNewFieldChange = (changes: Partial<DirectoryField>) => {
    setNewField(prev => ({ ...prev, ...changes }));
  };

  const handleMetadataEdit = (field: DirectoryField) => {
    setSelectedFieldForMetadata(field);
    setMetadataEditorOpen(true);
  };

  const handleMetadataSave = (metadata: KeyValueObject) => {
    if (selectedFieldForMetadata) {
      handleFieldChange(selectedFieldForMetadata.id, { metadata });
      setSelectedFieldForMetadata(null);
    }
  };

  const renderFieldInputs = (field: DirectoryField, isNew: boolean = false) => {
    const handleChange = isNew ? handleNewFieldChange : (changes: Partial<DirectoryField>) => handleFieldChange(field.id, changes);
    const value = isNew ? newField : field;

    return (
      <>
        <TextField
          label={t('directories.fieldName')}
          value={value.name}
          onChange={(e) => handleChange({ name: e.target.value })}
          fullWidth
        />
        <TextField
          select
          label={t('directories.fieldType')}
          value={value.type}
          onChange={(e) => handleChange({ type: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          {fieldTypes.map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>
        {value.type === 'relation' && (
          <TextField
            select
            label={t('directories.relatedDirectory')}
            value={value.relation_id || ''}
            onChange={(e) => handleChange({ relation_id: e.target.value })}
            sx={{ minWidth: 200 }}
          >
            {directories
              .filter(dir => dir.id !== currentDirectoryId) // Exclude current directory
              .map(dir => (
                <MenuItem key={dir.id} value={dir.id}>
                  {dir.name}
                </MenuItem>
              ))}
          </TextField>
        )}
      </>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" fontWeight={600}>
        {t('directories.fields')}
      </Typography>

      {/* Existing Fields */}
      {fields.map((field) => (
        <Paper key={field.id} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          {renderFieldInputs(field)}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('directories.editMetadata', 'Edit Metadata')}>
              <IconButton
                onClick={() => handleMetadataEdit(field)}
                sx={{ color: '#3b82f6' }}
              >
                <Icon icon="ph:gear" width={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('directories.deleteField', 'Delete Field')}>
              <IconButton
                onClick={() => handleRemoveField(field.id)}
                sx={{ color: '#ef4444' }}
              >
                <Icon icon="ph:trash" width={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      ))}

      <Divider />

      {/* Add New Field */}
      <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        {renderFieldInputs(newField as DirectoryField, true)}
        <Button
          variant="contained"
          onClick={handleAddField}
          disabled={!newField.name || (newField.type === 'relation' && !newField.relation_id)}
          sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}
        >
          {t('directories.addField')}
        </Button>
      </Paper>

      {/* Metadata Editor Dialog */}
      {selectedFieldForMetadata && (
        <DirectoryFieldMetadataEditor
          open={metadataEditorOpen}
          onClose={() => {
            setMetadataEditorOpen(false);
            setSelectedFieldForMetadata(null);
          }}
          field={selectedFieldForMetadata}
          onSave={handleMetadataSave}
        />
      )}
    </Box>
  );
};

export default DirectoryFieldsEditor; 