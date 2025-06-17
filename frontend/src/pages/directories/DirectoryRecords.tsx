import type { RootState } from '@/store';
import { fetchCompanyDirectories } from '@/store/slices/companyDirectoriesSlice';
import { fetchDirectoryRecords } from '@/store/slices/directoryRecordsSlice';
import { fetchDirectoryFieldsStart } from '@/store/slices/directoriesSlice';
import { Icon } from '@iconify/react';
import { Box, Button, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import AddDirectoryRecordDrawer from './components/AddDirectoryRecordDrawer';
import DirectoryRecordsTable from './components/DirectoryRecordsTable';

const DirectoryRecords: React.FC = () => {
  const { t } = useTranslation();
  const { directoryId } = useParams<{ directoryId: string }>();
  const dispatch = useDispatch();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const { companyDirectories } = useSelector((state: RootState) => state.companyDirectories);
  const records = useSelector((state: RootState) => state.directoryRecords.records);

  const directory = companyDirectories.find(dir => dir.id === directoryId) as any;
  console.log('====================================');
  console.log({ records });
  console.log('====================================');
  useEffect(() => {
    if (user && user.company_id) {
      dispatch(fetchCompanyDirectories(user.company_id));
    } else if (user && user.company && user.company.id) {
      dispatch(fetchCompanyDirectories(user.company.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (directoryId && companyDirectories.length > 0) {


      dispatch(fetchDirectoryRecords({ companyDirectoryId: directory.company_directory_id }));
      dispatch(fetchDirectoryFieldsStart(directory.id));
    } else {
      console.log('DirectoryRecords - No matching directory found for ID:', directoryId);
    }
  }, [directoryId, companyDirectories, dispatch]);

  console.log('====================================');
  console.log({ companyDirectories, directory });
  console.log('====================================');
  // Note: Added type assertion 'as any' to handle company_directory_id which might not be in the type definition.

  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, width: '100%' }}>
        <Typography variant="h4" fontWeight={700}>
          {directory ? directory.name : t('directories.records.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="ph:plus" />}
          onClick={() => setIsAddDrawerOpen(true)}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            bgcolor: '#3b82f6',
            '&:hover': {
              bgcolor: '#2563eb',
            },
          }}
        >
          {t('directories.records.addNew')}
        </Button>
      </Box>

      <DirectoryRecordsTable companyDirectoryId={(directory as any)?.company_directory_id} />

      <AddDirectoryRecordDrawer
        open={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        companyDirectoryId={(directory as any)?.company_directory_id}
        directoryId={directoryId}
      />
    </Box>
  );
};

export default DirectoryRecords;
