import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import { getDirectoryPageComponent } from './directoryPageRegistry';
import DirectoryRecordsTable from './components/DirectoryRecordsTable';
import type { DirectoryEntry, DirectoryField as APIDirectoryField } from '@/api/services/directories';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AddDirectoryRecordDrawer from './components/AddDirectoryRecordDrawer';
import { Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();

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
  // Map DirectoryEntry[] to DirectoryRecordApi[] for the table
  const mappedRecords = records.map((entry) => ({
    id: entry.id,
    company_directory_id: fullData?.companyDirectory?.id ? String(fullData.companyDirectory.id) : undefined,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
    recordValues: (entry.values || []).map(v => {
      const field = directoryFields.find(f => f.id === v.attribute_id);
      return {
        id: `${entry.id}_${v.attribute_id}`,
        field_id: v.attribute_id,
        value: v.value,
        field: field || { id: v.attribute_id, name: v.attribute_id, type: 'text', directory_id: entry.directory_type_id, relation_id: null },
      };
    }),
  }));

  // Get the correct component to render
  const metadata = (fullData?.directory?.metadata || {}) as Record<string, unknown>;
  const componentName = metadata?.componentName as string | undefined;
  const DirectoryComponent = getDirectoryPageComponent(componentName);

  const handleRecordAdded = React.useCallback(() => {
    if (directoryId && companyId) {
      queryClient.invalidateQueries({ queryKey: ['directoryRecordsFull', directoryId, companyId] as const });
    }
  }, [queryClient, directoryId, companyId]);

  if (recordsLoading) return <div>{t('directories.records.loadingDirectories', 'Loading directories...')}</div>;
  if (recordsError) return <div>{t('directories.records.errorLoadingDirectories', 'Error loading directories:')} {String(recordsError)}</div>;
  if (!fullData?.directory) return <div>{t('directories.records.notFound', 'Directory not found.')}</div>;
  if (!fullData?.companyDirectory) return <div>{t('directories.records.companyDirectoryNotFound', 'Company Directory mapping not found.')}</div>;

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
          {t('directories.records.create', '+ Create')}
        </Button>
      </Box>
      <DirectoryRecordsTable
        records={mappedRecords}
        loading={recordsLoading}
        error={recordsError}
        fields={directoryFields}
      />
      <AddDirectoryRecordDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        companyDirectoryId={fullData?.companyDirectory?.id ? String(fullData.companyDirectory.id) : undefined}
        directoryId={directoryId}
        onSuccess={handleRecordAdded}
      />
    </Box>
  );
};

export default DirectoryRecords;
