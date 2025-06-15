import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { fetchDirectoryRecords } from '@/store/slices/directoryRecordsSlice';
import { fetchDirectoryFieldsStart } from '@/store/slices/directoriesSlice';

const DirectoryRecordsTable: React.FC<{ companyDirectoryId: string | undefined }> = ({ companyDirectoryId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const records = useSelector((state: RootState) => state.directoryRecords.records);
  const loading = useSelector((state: RootState) => state.directoryRecords.loading);
  const error = useSelector((state: RootState) => state.directoryRecords.error);
  const fields = useSelector((state: RootState) => state.directories.fields);
  const fieldsLoading = useSelector((state: RootState) => state.directories.fieldsLoading);
  const fieldsError = useSelector((state: RootState) => state.directories.fieldsError);

  useEffect(() => {
    if (companyDirectoryId) {
      dispatch(fetchDirectoryRecords({ companyDirectoryId }));
      if (!fields[companyDirectoryId] && !fieldsLoading[companyDirectoryId as string]) {
        dispatch(fetchDirectoryFieldsStart(companyDirectoryId));
      }
    }
  }, [companyDirectoryId, dispatch, fields, fieldsLoading]);

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t('directories.records.id')}</TableCell>
              {companyDirectoryId && fields[companyDirectoryId as string] && fields[companyDirectoryId as string].length > 0 ? (
                fields[companyDirectoryId as string].map((field) => (
                  <TableCell key={field.id} sx={{ fontWeight: 600 }}>
                    {field.name}
                  </TableCell>
                ))
              ) : (
                <TableCell sx={{ fontWeight: 600 }}>{t('directories.records.fields')}</TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>{t('directories.records.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
              <TableCell colSpan={companyDirectoryId && fields[companyDirectoryId as string] && fields[companyDirectoryId as string].length > 0 ? fields[companyDirectoryId as string].length + 2 : 3} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  {t('directories.records.loading')}
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
              <TableCell colSpan={companyDirectoryId && fields[companyDirectoryId as string] && fields[companyDirectoryId as string].length > 0 ? fields[companyDirectoryId as string].length + 2 : 3} sx={{ textAlign: 'center', color: 'error.main' }}>
                  {t('directories.records.error')}: {error}
                </TableCell>
              </TableRow>
            ) : Array.isArray(records) && records.length > 0 ? (
              records.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{record.id}</TableCell>
                  {companyDirectoryId && fields[companyDirectoryId as string] && fields[companyDirectoryId as string].length > 0 ? (
                    fields[companyDirectoryId as string].map((field) => (
                      <TableCell key={field.id}>
                        {(record.values as Record<string, any>)[field.id.toString()] !== undefined ? String((record.values as Record<string, any>)[field.id.toString()]) : '-'}
                      </TableCell>
                    ))
                  ) : (
                    <TableCell>
                      {Object.values(record.values).map((value, index) => (
                        <Chip key={index} label={String(value)} sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </TableCell>
                  )}
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
              <TableCell colSpan={companyDirectoryId && fields[companyDirectoryId as string] && fields[companyDirectoryId as string].length > 0 ? fields[companyDirectoryId as string].length + 2 : 3} sx={{ textAlign: 'center', color: 'text.secondary' }}>
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
