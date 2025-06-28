import { Icon } from '@iconify/react';
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  field_id: string;
  value: string | number | boolean;
  field: DirectoryField;
  [key: string]: unknown;
}

interface DirectoryRecordApi {
  id: string;
  company_directory_id?: string;
  createdAt?: string;
  updatedAt?: string;
  recordValues: DirectoryRecordValue[];
  [key: string]: unknown;
}

interface DirectoryRecordsTableProps {
  records: DirectoryRecordApi[];
  loading: boolean;
  error: unknown;
  fields: DirectoryField[];
}

const DirectoryRecordsTable: React.FC<DirectoryRecordsTableProps> = ({ records, loading, error, fields }) => {
  const { t } = useTranslation();

  const displayFields = (fields || [])
    .filter(field => field.metadata?.isVisibleOnTable)
    .sort((a, b) => Number(a.metadata?.fieldOrder ?? 0) - Number(b.metadata?.fieldOrder ?? 0));

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
                    return (
                      <TableCell key={field.id}>
                        {valueObj ? String(valueObj.value) : '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell sx={{ textAlign: 'right' }}>
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <Icon icon="ph:pencil-simple" />
                    </IconButton>
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
