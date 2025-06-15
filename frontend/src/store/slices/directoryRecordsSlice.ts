import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DirectoryEntry } from '@/api/services/directories';

interface DirectoryRecordsState {
  records: DirectoryEntry[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  adding: boolean;
  addError: string | null;
  updating: Record<string, boolean>;
  updateError: Record<string, string | null>;
  deleting: Record<string, boolean>;
  deleteError: Record<string, string | null>;
}

const initialState: DirectoryRecordsState = {
  records: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
  },
  adding: false,
  addError: null,
  updating: {},
  updateError: {},
  deleting: {},
  deleteError: {},
};

const directoryRecordsSlice = createSlice({
  name: 'directoryRecords',
  initialState,
  reducers: {
    fetchDirectoryRecords: (state, action: PayloadAction<{ companyDirectoryId: string; page?: number; limit?: number; search?: string; filters?: Record<string, any> }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchDirectoryRecordsSuccess: (state, action: PayloadAction<{
      records: DirectoryEntry[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      };
    }>) => {
      state.loading = false;
      state.records = action.payload.records;
      state.pagination = action.payload.pagination;
    },
    fetchDirectoryRecordsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addDirectoryRecord: (state, action: PayloadAction<{ companyDirectoryId: string; values: Array<{ attribute_id: string; value: string | number | boolean }> }>) => {
      state.adding = true;
      state.addError = null;
    },
    addDirectoryRecordSuccess: (state, action: PayloadAction<DirectoryEntry>) => {
      state.adding = false;
      state.records.push(action.payload);
    },
    addDirectoryRecordFailure: (state, action: PayloadAction<string>) => {
      state.adding = false;
      state.addError = action.payload;
    },
    updateDirectoryRecord: (state, action: PayloadAction<{ companyDirectoryId: string; recordId: string; values: Array<{ attribute_id: string; value: string | number | boolean }> }>) => {
      const { recordId } = action.payload;
      state.updating[recordId] = true;
      state.updateError[recordId] = null;
    },
    updateDirectoryRecordSuccess: (state, action: PayloadAction<DirectoryEntry>) => {
      const updatedRecord = action.payload;
      state.updating[updatedRecord.id] = false;
      state.records = state.records.map(record =>
        record.id === updatedRecord.id ? updatedRecord : record
      );
    },
    updateDirectoryRecordFailure: (state, action: PayloadAction<{ recordId: string; error: string }>) => {
      const { recordId, error } = action.payload;
      state.updating[recordId] = false;
      state.updateError[recordId] = error;
    },
    deleteDirectoryRecord: (state, action: PayloadAction<{ companyDirectoryId: string; recordId: string }>) => {
      const { recordId } = action.payload;
      state.deleting[recordId] = true;
      state.deleteError[recordId] = null;
    },
    deleteDirectoryRecordSuccess: (state, action: PayloadAction<string>) => {
      const recordId = action.payload;
      state.deleting[recordId] = false;
      state.records = state.records.filter(record => record.id !== recordId);
    },
    deleteDirectoryRecordFailure: (state, action: PayloadAction<{ recordId: string; error: string }>) => {
      const { recordId, error } = action.payload;
      state.deleting[recordId] = false;
      state.deleteError[recordId] = error;
    },
  },
});

export const {
  fetchDirectoryRecords,
  fetchDirectoryRecordsSuccess,
  fetchDirectoryRecordsFailure,
  addDirectoryRecord,
  addDirectoryRecordSuccess,
  addDirectoryRecordFailure,
  updateDirectoryRecord,
  updateDirectoryRecordSuccess,
  updateDirectoryRecordFailure,
  deleteDirectoryRecord,
  deleteDirectoryRecordSuccess,
  deleteDirectoryRecordFailure,
} = directoryRecordsSlice.actions;

export default directoryRecordsSlice.reducer;
