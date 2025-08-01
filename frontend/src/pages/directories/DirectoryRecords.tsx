import React, { Suspense, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import { getDirectoryPageComponent } from './directoryPageRegistry';
import DirectoryRecordsTable from './components/DirectoryRecordsTable';
import type { DirectoryField as APIDirectoryField } from '@/api/services/directories';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AddDirectoryRecordDrawer from './components/AddDirectoryRecordDrawer';
import { 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Chip
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import DirectoryMetadataEditor from './components/DirectoryMetadataEditor';
import DirectoryRecordMetadataEditor from './components/DirectoryRecordMetadataEditor';
import { CascadingConfig, cascadingApi } from '@/api/services/cascading';

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

interface FullDataResponse {
  directory: Record<string, unknown>;
  companyDirectory: Record<string, unknown>;
  directoryRecords: Array<{
    id: string;
    company_directory_id: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    recordValues: Array<{
      id: string;
      directory_record_id: string;
      field_id: string;
      value: string | number | boolean;
      created_at: string;
      updated_at: string;
      field: DirectoryField;
    }>;
  }>;
  fields: DirectoryField[];
}

const DirectoryRecords: React.FC = () => {
  const { directoryId } = useParams<{ directoryId: string }>();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [cascadingConfigOpen, setCascadingConfigOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<DirectoryRecordApi | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Check if user is super admin
  const isSuperAdmin = user && Array.isArray(user.roles) && 
    user.roles.some((role) => role.name === 'super_admin');

  // Get company info from navigation state
  const companyInfo = location.state as { 
    companyId?: string; 
    companyName?: string; 
    directoryName?: string 
  } | null;

  // Use companyId from navigation state if available, otherwise fall back to user's company_id
  const companyId = companyInfo?.companyId || user?.company_id;

  // Debug logs
  console.log('DirectoryRecords Debug:', { directoryId, companyId, isSuperAdmin, companyInfo });
  console.log('useDirectoryRecords will be called with:', { directoryId, companyId });

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
    recordValues: (entry.recordValues || []).map((v) => {
      return {
        id: v.id,
        field_id: v.field_id,
        value: v.value,
        field: v.field,
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



  const handleCascadingConfigSave = React.useCallback(async (recordId: string, cascadingConfig: CascadingConfig) => {
    try {
      console.log('Saving cascading config for record:', recordId, 'config:', cascadingConfig);
      
      // Call the API to save the cascading configuration
      const response = await cascadingApi.updateCascadingConfig(recordId, cascadingConfig);
      
      if (response.data.success) {
        console.log('Cascading configuration saved successfully');
        
        // Invalidate the query to refresh the data
        if (directoryId && companyId) {
          queryClient.invalidateQueries({ queryKey: ['directoryRecordsFull', directoryId, companyId] as const });
        }
      } else {
        throw new Error('Failed to save cascading configuration');
      }
    } catch (error) {
      console.error('Error saving cascading config:', error);
      throw error;
    }
  }, [queryClient, directoryId, companyId]);

  const handleOpenCascadingConfig = (record: DirectoryRecordApi) => {
    setSelectedRecord(record);
    setCascadingConfigOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Check if we have the required parameters
  if (!directoryId || !companyId) {
    return (
      <div>
        {!directoryId && <div>Directory ID is missing</div>}
        {!companyId && <div>Company ID is missing. Please navigate from a company page.</div>}
      </div>
    );
  }

  if (recordsLoading) return <div>{t('directories.records.loadingDirectories', 'Loading directories...')}</div>;
  if (recordsError) {
    console.error('DirectoryRecords Error:', recordsError);
    return <div>{t('directories.records.errorLoadingDirectories', 'Error loading directories:')} {String(recordsError)}</div>;
  }
  if (!fullData?.directory) return <div>{t('directories.records.notFound', 'Directory not found.')}</div>;
  if (!fullData?.companyDirectory) {
    console.error('CompanyDirectory not found for:', { directoryId, companyId });
    return <div>{t('directories.records.companyDirectoryNotFound', 'Company Directory mapping not found. This directory may not be enabled for this company.')}</div>;
  }

  // If there's a custom component, render it
  if (componentName) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DirectoryComponent />
      </Suspense>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with company and directory info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {companyInfo?.directoryName || (fullData?.directory?.name as string) || 'Directory Records'}
            </Typography>
            {companyInfo?.companyName && (
              <Typography variant="body2" color="text.secondary">
                Company: {companyInfo.companyName}
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={1}>
            <Chip 
              label={(fullData?.directory?.directory_type as string) || 'Module'} 
              color="primary" 
              size="small" 
            />
            {isSuperAdmin && (
              <Chip 
                label="Super Admin" 
                color="secondary" 
                size="small" 
                icon={<Icon icon="mdi:shield-crown" />}
              />
            )}
          </Box>
        </Box>

        {/* Tabs for Records and Metadata (if super admin) */}
        {isSuperAdmin && (
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label={t('directories.records.records', 'Records')} />
            <Tab label={t('directories.records.metadata', 'Metadata')} />
          </Tabs>
        )}
      </Paper>

      {/* Records Tab */}
      {(!isSuperAdmin || activeTab === 0) && (
        <Box>
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
                  onCascadingConfig={handleOpenCascadingConfig}
                />
          <AddDirectoryRecordDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            companyDirectoryId={fullData?.companyDirectory?.id ? String(fullData.companyDirectory.id) : undefined}
            directoryId={directoryId}
            onSuccess={handleRecordAdded}
          />
        </Box>
      )}

      {/* Metadata Tab (Super Admin Only) */}
      {isSuperAdmin && activeTab === 1 && (
        <DirectoryMetadataEditor
          directoryId={directoryId}
          companyDirectoryId={fullData?.companyDirectory?.id ? String(fullData.companyDirectory.id) : undefined}
          fields={directoryFields}
          metadata={metadata}
          onSuccess={handleRecordAdded}
        />
      )}

      {/* Cascading Configuration Dialog */}
      {selectedRecord && (
        <DirectoryRecordMetadataEditor
          record={selectedRecord}
          open={cascadingConfigOpen}
          onClose={() => {
            setCascadingConfigOpen(false);
            setSelectedRecord(null);
          }}
          onSave={handleCascadingConfigSave}
        />
      )}
    </Box>
  );
};

export default DirectoryRecords;
