import { Icon } from '@iconify/react';
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DirectoryField as APIDirectoryField } from '@/api/services/directories';

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
    field_id: string;
    value: string | number | boolean;
    field: DirectoryField;
    metadata?: Record<string, unknown>;
  }>;
}

interface DirectoryRecordsTableProps {
  records: DirectoryRecordApi[];
  loading: boolean;
  error: unknown;
  fields: DirectoryField[];
  onCascadingConfig?: (record: DirectoryRecordApi) => void;
}

const DirectoryRecordsTable: React.FC<DirectoryRecordsTableProps> = ({ records, loading, error, fields, onCascadingConfig }) => {
  const { t } = useTranslation();

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
    // TODO: Implement record editing functionality
    console.log('Edit record:', record);
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
                    const valueObj = record.recordValues.find((v) => v.field_id === field.id);
                    console.log(`Field ${field.name} (${field.id}):`, { valueObj, field });
                    return (
                      <TableCell key={field.id}>
                        {valueObj ? String(valueObj.value) : '-'}
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
                    {onCascadingConfig && (
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
                    <IconButton size="small" color="error">
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
