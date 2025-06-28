import React, { Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import { getDirectoryPageComponent } from './directoryPageRegistry';
import DirectoryRecordsTable from './components/DirectoryRecordsTable';
import type { DirectoryEntry, DirectoryField as APIDirectoryField } from '@/api/services/directories';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AddDirectoryRecordDrawer from './components/AddDirectoryRecordDrawer';
import { Button, Box } from '@mui/material';

// DirectoryField type compatible with both backend and frontend
interface DirectoryField extends Omit<APIDirectoryField, 'relation_id'> {
  relation_id: string | null;
}

interface FullDataResponse {
  directory: Record<string, unknown>;
  companyDirectory: Record<string, unknown>;
  directoryRecords: DirectoryEntry[];
  fields: DirectoryField[];
}

const DirectoryRecords: React.FC = () => {
  const { directoryId } = useParams<{ directoryId: string }>();
  const companyId = useSelector((state: RootState) => state.auth.user?.company_id);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Debug logs
  console.log('DirectoryRecords Debug:', { directoryId, companyId });

  const {
    data: fullData,
    isLoading: recordsLoading,
    error: recordsError,
  } = useDirectoryRecords(directoryId || '', companyId || '') as unknown as { data: FullDataResponse; isLoading: boolean; error: unknown };

  // Ensure fields always have relation_id as string | null
  const directoryFields: DirectoryField[] = (fullData?.fields || []).map((f) => ({
    ...f,
    relation_id: f.relation_id === undefined ? null : f.relation_id,
  }));

  const records = fullData?.directoryRecords || [];

  // Get the correct component to render
  const metadata = (fullData?.directory?.metadata || {}) as Record<string, unknown>;
  const componentName = metadata?.componentName as string | undefined;
  const DirectoryComponent = getDirectoryPageComponent(componentName);

  if (recordsLoading) return <div>Loading directories...</div>;
  if (recordsError) return <div>Error loading directories: {String(recordsError)}</div>;
  if (!fullData?.directory) return <div>Directory not found.</div>;
  if (!fullData?.companyDirectory) return <div>Company Directory mapping not found.</div>;

  if (componentName) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DirectoryComponent />
      </Suspense>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setDrawerOpen(true)}>
          + Create
        </Button>
      </Box>
      <DirectoryRecordsTable
        records={records}
        loading={recordsLoading}
        error={recordsError}
        fields={directoryFields}
      />
      <AddDirectoryRecordDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        companyDirectoryId={fullData?.companyDirectory?.id ? String(fullData.companyDirectory.id) : undefined}
        directoryId={directoryId}
      />
    </Box>
  );
};

export default DirectoryRecords;
