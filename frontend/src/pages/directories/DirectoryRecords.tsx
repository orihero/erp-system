import React from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useDirectoryRecords } from '@/hooks/useDirectoryRecords';
import { cascadingApi } from '@/api/services/cascading';
import { RootState } from '@/store';
import { useDispatch } from 'react-redux';
import { deleteDirectoryRecord } from '@/store/slices/directoryRecordsSlice';
import DirectoryRecordsTable from './components/DirectoryRecordsTable';
import AddDirectoryRecordDrawer from './components/AddDirectoryRecordDrawer';
import EditDirectoryRecordDrawer from './components/EditDirectoryRecordDrawer';
import DirectoryRecordMetadataEditor from './components/DirectoryRecordMetadataEditor';
import { getDirectoryPageComponent } from './directoryPageRegistry';
import type { CascadingConfig } from '@/api/services/cascading';
import type { DirectoryField as APIDirectoryField } from '@/api/services/directories';

// Type for the full directory data response
interface FullDirectoryData {
  directory: {
    id: string;
    name: string;
    icon_name: string;
    directory_type: string;
    created_at: string;
    updated_at: string;
    is_enabled?: boolean;
    metadata?: Record<string, unknown>;
  };
  companyDirectory: {
    id: string;
    company_id: string;
    directory_id: string;
    module_id: string;
    createdAt: string;
    updatedAt: string;
    directory: {
      id: string;
      name: string;
      icon_name: string;
      directory_type: string;
      created_at: string;
      updated_at: string;
      is_enabled?: boolean;
      metadata?: Record<string, unknown>;
    };
  };
  directoryRecords: Array<{
    id: string;
    company_directory_id: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    recordValues: Array<{
      id: string;
      field_id: string | null;
      value: string | number | boolean;
      field: DirectoryField | null;
      metadata?: Record<string, unknown>;
    }>;
  }>;
  fields: APIDirectoryField[];
}

// Use the same interfaces as DirectoryRecordsTable
interface DirectoryField extends Omit<APIDirectoryField, 'relation_id'> {
  relation_id: string | null;
}

interface DirectoryRecordApi {
  id: string;
  company_directory_id?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
  recordValues: Array<{
    id: string;
    field_id: string | null;
    value: string | number | boolean;
    field: DirectoryField | null;
    metadata?: Record<string, unknown>;
  }>;
}

const DirectoryRecords: React.FC = () => {
  const { directoryId } = useParams<{ directoryId: string }>();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = React.useState(false);
  const [cascadingConfigOpen, setCascadingConfigOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<DirectoryRecordApi | null>(null);
  const [recordToEdit, setRecordToEdit] = React.useState<DirectoryRecordApi | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<DirectoryRecordApi | null>(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Get company info from navigation state
  const companyInfo = location.state as { 
    companyId?: string; 
    companyName?: string; 
    directoryName?: string 
  } | null;

  // Use companyId from navigation state if available, otherwise fall back to user's company_id
  const companyId = companyInfo?.companyId || user?.company_id;

  // Debug logs
  console.log('DirectoryRecords Debug:', { 
    directoryId, 
    companyId, 
    companyInfo,
    userCompanyId: user?.company_id,
    locationState: location.state
  });

  const {
    data: fullData,
    isLoading: recordsLoading,
    error: recordsError,
  } = useDirectoryRecords(directoryId || '', companyId || '') as {
    data: FullDirectoryData | undefined;
    isLoading: boolean;
    error: unknown;
  };

  // Fallback: If we don't have company info from navigation state, try to get it from the API response
  const effectiveCompanyId = companyId || (fullData?.companyDirectory?.company_id as string);

  // Ensure fields always have relation_id as string | null
  const directoryFields: DirectoryField[] = (fullData?.fields || []).map((f: APIDirectoryField) => ({
    ...f,
    relation_id: f.relation_id === undefined ? null : f.relation_id,
  }));

  // Debug: Log the fields structure
  console.log('DirectoryRecords - Fields structure:', directoryFields);

  const records = fullData?.directoryRecords || [];
  
  // Debug: Log the first record to see the structure
  if (records.length > 0) {
    console.log('DirectoryRecords - First record structure:', records[0]);
    console.log('DirectoryRecords - First record values:', records[0].recordValues);
    console.log('DirectoryRecords - First record metadata:', records[0].metadata);
  }
  
  // Map the records to the expected format - the API already provides the correct structure
  const mappedRecords: DirectoryRecordApi[] = records.map((entry) => {
    return {
      id: entry.id,
      company_directory_id: entry.company_directory_id,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      metadata: entry.metadata,
      recordValues: entry.recordValues || [],
    };
  });

  // Get the correct component to render
  const metadata = (fullData?.directory?.metadata || {}) as Record<string, unknown>;
  const componentName = metadata?.componentName as string | undefined;
  const DirectoryComponent = getDirectoryPageComponent(componentName);

  const handleRecordAdded = React.useCallback(() => {
    if (directoryId && effectiveCompanyId) {
      queryClient.invalidateQueries({ queryKey: ['directoryRecordsFull', directoryId, effectiveCompanyId] as const });
    }
  }, [queryClient, directoryId, effectiveCompanyId]);

  const handleCascadingConfigSave = React.useCallback(async (recordId: string, cascadingConfig: CascadingConfig) => {
    try {
      console.log('Saving cascading config for record:', recordId, 'config:', cascadingConfig);
      
      // Call the API to save the cascading configuration
      const response = await cascadingApi.updateCascadingConfig(recordId, cascadingConfig);
      
      if (response.data.success) {
        console.log('Cascading configuration saved successfully');
        
        // Invalidate the query to refresh the data
        if (directoryId && effectiveCompanyId) {
          queryClient.invalidateQueries({ queryKey: ['directoryRecordsFull', directoryId, effectiveCompanyId] as const });
        }
      } else {
        throw new Error('Failed to save cascading configuration');
      }
    } catch (error) {
      console.error('Error saving cascading config:', error);
      throw error;
    }
  }, [queryClient, directoryId, effectiveCompanyId]);

  const handleOpenCascadingConfig = (record: DirectoryRecordApi) => {
    setSelectedRecord(record);
    setCascadingConfigOpen(true);
  };

  const handleEditRecord = (record: DirectoryRecordApi) => {
    console.log('EditDirectoryRecord - Record to edit:', record);
    console.log('EditDirectoryRecord - Record values:', record.recordValues);
    setRecordToEdit(record);
    setEditDrawerOpen(true);
  };

  const handleDeleteRecord = (record: DirectoryRecordApi) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete && effectiveCompanyId) {
      try {
        dispatch(deleteDirectoryRecord({
          companyDirectoryId: effectiveCompanyId,
          recordId: recordToDelete.id
        }));
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  // If there's a custom component, render it
  if (componentName) {
    return (
      <DirectoryComponent />
    );
  }

  return (
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
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
      />
      
      <AddDirectoryRecordDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        companyDirectoryId={
          fullData?.companyDirectory?.id && 
          typeof fullData.companyDirectory.id === 'string' &&
          !fullData.companyDirectory.id.startsWith('system-') && 
          !fullData.companyDirectory.id.startsWith('temp-')
            ? String(fullData.companyDirectory.id) 
            : undefined
        }
        directoryId={directoryId}
        onSuccess={handleRecordAdded}
      />

      {/* Edit Directory Record Drawer */}
      <EditDirectoryRecordDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setRecordToEdit(null);
        }}
        record={recordToEdit}
        companyDirectoryId={
          fullData?.companyDirectory?.id && 
          typeof fullData.companyDirectory.id === 'string' &&
          !fullData.companyDirectory.id.startsWith('system-') && 
          !fullData.companyDirectory.id.startsWith('temp-')
            ? String(fullData.companyDirectory.id) 
            : undefined
        }
        directoryId={directoryId}
        onSuccess={handleRecordAdded}
      />

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>{t('directories.records.deleteConfirm', 'Delete Record')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('directories.records.deleteWarning', 'Are you sure you want to delete this record? This action cannot be undone.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DirectoryRecords;
