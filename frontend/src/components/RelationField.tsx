import React from 'react';
import { TextField, MenuItem, CircularProgress, Typography, Box } from '@mui/material';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import type { DirectoryEntry, DirectoryField } from '@/api/services/directories';

interface RelationFieldProps {
  relationDirectoryId: string;
  companyId: string;
  value: string | undefined;
  onChange: (value: string) => void;
  labelFieldId?: string;
  disabled?: boolean;
  required?: boolean;
  currentDirectoryId?: string; // for self-reference check
  label?: string;
}

const RelationField: React.FC<RelationFieldProps> = ({
  relationDirectoryId,
  companyId,
  value,
  onChange,
  labelFieldId,
  disabled,
  required,
  currentDirectoryId,
  label,
}) => {
  const { data, isLoading, error } = useDirectoryRecords(relationDirectoryId, companyId);
  // Use fields from data.directory.fields
  const fields: DirectoryField[] = (data?.directory?.fields || []) as DirectoryField[];
  const records: DirectoryEntry[] = data?.directoryRecords || [];

  // Prevent self-reference (must be after hook call)
  if (!relationDirectoryId || relationDirectoryId === currentDirectoryId) {
    return <Typography color="text.secondary">Invalid relation</Typography>;
  }

  // Find the best label field
  let labelField: DirectoryField | undefined;
  if (labelFieldId) {
    labelField = fields.find(f => f.id === labelFieldId);
  }
  if (!labelField) {
    labelField = fields.find(f => f.metadata?.isVisibleOnTable);
  }
  if (!labelField && fields.length > 0) {
    labelField = fields[0];
  }

  // Helper to get label for a record
  const getLabel = (record: DirectoryEntry): string => {
    if (labelField) {
      const valObj = record.values.find(v => v.attribute_id === labelField!.id);
      if (valObj && valObj.value !== undefined && valObj.value !== null) {
        return String(valObj.value);
      }
    }
    // Fallback: show record id
    return record.id;
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={18} /> <Typography>Loading...</Typography></Box>;
  }
  if (error) {
    return <Typography color="error">Failed to load relation records</Typography>;
  }

  return (
    <TextField
      select
      fullWidth
      margin="normal"
      label={label || labelField?.name || 'Select record'}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      required={required}
      disabled={disabled}
    >
      <MenuItem value="">Select...</MenuItem>
      {records.length === 0 ? (
        <MenuItem value="" disabled>No records found</MenuItem>
      ) : (
        records.map(rec => (
          <MenuItem key={rec.id} value={rec.id}>{getLabel(rec)}</MenuItem>
        ))
      )}
    </TextField>
  );
};

export default RelationField; 