import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import DirectoryRecordsTable from './components/DirectoryRecordsTable';
import AddDirectoryRecordDrawer from './components/AddDirectoryRecordDrawer';
import { fetchCompanyDirectories } from '@/store/slices/companyDirectoriesSlice';
import { fetchDirectoryRecords } from '@/store/slices/directoryRecordsSlice';

const DirectoryRecords: React.FC = () => {
  const { t } = useTranslation();
  const { directoryId } = useParams<{ directoryId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const { companyDirectories } = useSelector((state: RootState) => state.companyDirectories);

  useEffect(() => {
    if (user && user.company_id) {
      dispatch(fetchCompanyDirectories(user.company_id));
    } else if (user && user.company && user.company.id) {
      dispatch(fetchCompanyDirectories(user.company.id));
    }
    if (directoryId) {
      dispatch(fetchDirectoryRecords({ companyDirectoryId: directoryId }));
    }
  }, [user, directoryId, dispatch]);

  const directory = companyDirectories.find(dir => dir.id === directoryId);

  console.log('====================================');
  console.log({ companyDirectories, directory });
  console.log('====================================');

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

      <DirectoryRecordsTable companyDirectoryId={directory?.id} />

      <AddDirectoryRecordDrawer
        open={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        companyDirectoryId={directory?.id}
        directoryId={directoryId}
      />
    </Box>
  );
};

export default DirectoryRecords;
