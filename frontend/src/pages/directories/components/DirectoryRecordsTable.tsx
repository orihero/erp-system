import { Icon } from '@iconify/react';
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { DirectoryField as APIDirectoryField } from '@/api/services/directories';
import type { RootState } from '@/store';

// DirectoryField type compatible with both backend and frontend
interface DirectoryField extends Omit<APIDirectoryField, 'relation_id'> {
  relation_id: string | null;
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

interface DirectoryRecordsTableProps {
  records: DirectoryRecordApi[];
  loading: boolean;
  error: unknown;
  fields: DirectoryField[];
  onCascadingConfig?: (record: DirectoryRecordApi) => void;
  onEditRecord?: (record: DirectoryRecordApi) => void;
  onDeleteRecord?: (record: DirectoryRecordApi) => void;
}

const DirectoryRecordsTable: React.FC<DirectoryRecordsTableProps> = ({ records, loading, error, fields, onCascadingConfig, onEditRecord, onDeleteRecord }) => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);

  // Check if user is admin (has admin or super_admin role)
  const isAdmin = user && Array.isArray(user.roles) && user.roles.some((role) => 
    role.name === 'admin' || role.name === 'super_admin'
  );

  const displayFields = (fields || [])
    .filter(field => field.metadata?.isVisibleOnTable !== false) // Show all fields by default unless explicitly hidden
    .sort((a, b) => Number(a.metadata?.fieldOrder ?? 0) - Number(b.metadata?.fieldOrder ?? 0));

  // Debug logs
  console.log('DirectoryRecordsTable Debug:', {
    fields: fields,
    displayFields: displayFields,
    records: records,
    firstRecord: records[0]
  });

  const handleEditRecord = (record: DirectoryRecordApi) => {
    if (onEditRecord) {
      onEditRecord(record);
    }
  };

  const handleDeleteRecord = (record: DirectoryRecordApi) => {
    if (onDeleteRecord) {
      onDeleteRecord(record);
    }
  };

  // Helper function to get display value for a field
  const getFieldValue = (record: DirectoryRecordApi, field: DirectoryField) => {
    // First try to find a value with matching field_id
    let valueObj = record.recordValues.find((v) => v.field_id === field.id);
    
    // If no match found and there's only one field, or if field_id is null (system directory case)
    if (!valueObj && (displayFields.length === 1 || record.recordValues.some(v => v.field_id === null))) {
      // For system directories or single field cases, use the first value
      valueObj = record.recordValues[0];
    }
    
    return valueObj ? String(valueObj.value) : '-';
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t('directories.records.id')}</TableCell>
              {displayFields.map((field) => (
                <TableCell key={field.id} sx={{ fontWeight: 600 }}>
                  {field.name}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('directories.records.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={Number(displayFields.length) + 2} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  {t('directories.records.loading')}
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={Number(displayFields.length) + 2} sx={{ textAlign: 'center', color: 'error.main' }}>
                  {t('directories.records.error')}: {String(error)}
                </TableCell>
              </TableRow>
            ) : Array.isArray(records) && records.length > 0 ? (
              records.map((record) => (
                <TableRow key={String(record.id)} hover>
                  <TableCell>{String(record.id)}</TableCell>
                  {displayFields.map((field) => {
                    const displayValue = getFieldValue(record, field);
                    console.log(`Field ${field.name} (${field.id}):`, { displayValue, field });
                    return (
                      <TableCell key={field.id}>
                        {displayValue}
                      </TableCell>
                    );
                  })}
                  <TableCell sx={{ textAlign: 'right' }}>
                    <IconButton 
                      size="small" 
                      sx={{ mr: 1 }}
                      onClick={() => handleEditRecord(record)}
                      title={t('directories.records.editRecord', 'Edit Record')}
                    >
                      <Icon icon="ph:pencil-simple" />
                    </IconButton>
                    {onCascadingConfig && isAdmin && (
                      <IconButton 
                        size="small" 
                        sx={{ mr: 1 }}
                        onClick={() => onCascadingConfig(record)}
                        title={t('directories.records.cascadingConfig', 'Cascading Configuration')}
                        color="primary"
                      >
                        <Icon icon="mdi:cog" />
                      </IconButton>
                    )}
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteRecord(record)}
                      title={t('directories.records.deleteRecord', 'Delete Record')}
                    >
                      <Icon icon="ph:trash" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={Number(displayFields.length) + 2} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  {t('directories.records.noRecords')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
};

export default DirectoryRecordsTable;
