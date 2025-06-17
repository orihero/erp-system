import type { RootState } from '@/store';
import { Icon } from '@iconify/react';
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface DirectoryField {
  id: string;
  name: string;
  type: string;
  directory_id: string;
  relation_id: string | null;
}

interface DirectoryRecordValue {
  id: string;
  field_id: string;
  value: string | number | boolean;
  field: DirectoryField;
}

interface DirectoryRecord {
  id: string;
  company_directory_id: string;
  recordValues: DirectoryRecordValue[];
  createdAt: string;
  updatedAt: string;
}

const DirectoryRecordsTable: React.FC<{ companyDirectoryId: string | undefined }> = ({ companyDirectoryId }) => {
  const { t } = useTranslation();
  const records = useSelector((state: RootState) => state.directoryRecords.records);
  const loading = useSelector((state: RootState) => state.directoryRecords.loading);
  const error = useSelector((state: RootState) => state.directoryRecords.error);
  const fields = useSelector((state: RootState) => state.directories.fields);

  console.log('=== DirectoryRecordsTable Debug ===');
  console.log('Company Directory ID:', companyDirectoryId);
  console.log('Fields:', fields);
  console.log('Records:', records);

  // Determine the fields to display
  const displayFields = companyDirectoryId && fields[companyDirectoryId] && fields[companyDirectoryId].length > 0 
    ? fields[companyDirectoryId] 
    : Object.values(fields).flat().length > 0 
      ? Object.values(fields).flat() 
      : [];

  console.log('Display Fields:', displayFields);

  const renderFieldValue = (record: any, fieldId: string) => {
    console.log(`Rendering value for record ${record.id}, field ${fieldId}:`, {
      recordValues: record.recordValues,
      fieldId,
      foundValue: record.recordValues?.find((v: any) => v.field_id === fieldId)
    });

    if (!record.recordValues || !Array.isArray(record.recordValues)) {
      console.log('No recordValues array found for record:', record.id);
      return '-';
    }
    
    const valueObj = record.recordValues.find((v: any) => v.field_id === fieldId);
    if (!valueObj) {
      console.log('No value found for field:', fieldId);
      return '-';
    }
    
    console.log('Found value:', valueObj.value);
    return String(valueObj.value);
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
                <TableCell colSpan={displayFields.length + 2} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  {t('directories.records.loading')}
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={displayFields.length + 2} sx={{ textAlign: 'center', color: 'error.main' }}>
                  {t('directories.records.error')}: {error}
                </TableCell>
              </TableRow>
            ) : Array.isArray(records) && records.length > 0 ? (
              records.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{record.id}</TableCell>
                  {displayFields.map((field) => (
                    <TableCell key={field.id}>
                      {renderFieldValue(record, field.id.toString())}
                    </TableCell>
                  ))}
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
                <TableCell colSpan={displayFields.length + 2} sx={{ textAlign: 'center', color: 'text.secondary' }}>
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
