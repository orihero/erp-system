import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Directory, DirectoryField } from '../../api/services/directories';

interface DirectoriesState {
  directories: Directory[];
  fields: Record<string, DirectoryField[]>;
  loading: boolean;
  error: string | null;
  fieldsLoading: Record<string, boolean>;
  fieldsError: Record<string, string | null>;
}

const initialState: DirectoriesState = {
  directories: [],
  fields: {},
  loading: false,
  error: null,
  fieldsLoading: {},
  fieldsError: {},
};

const directoriesSlice = createSlice({
  name: 'directories',
  initialState,
  reducers: {
    fetchDirectoriesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDirectoriesSuccess: (state, action: PayloadAction<Directory[]>) => {
      state.directories = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchDirectoriesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteDirectoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteDirectorySuccess: (state, action: PayloadAction<string>) => {
      state.directories = state.directories.filter(dir => dir.id !== action.payload);
      state.loading = false;
      state.error = null;
    },
    deleteDirectoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    editDirectoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    editDirectorySuccess: (state, action: PayloadAction<Directory>) => {
      const index = state.directories.findIndex(dir => dir.id === action.payload.id);
      if (index !== -1) {
        state.directories[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    editDirectoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createDirectoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createDirectorySuccess: (state, action: PayloadAction<Directory>) => {
      state.directories.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    createDirectoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchDirectoryFieldsStart: (state, action: PayloadAction<string>) => {
      state.fieldsLoading[action.payload] = true;
      state.fieldsError[action.payload] = null;
    },
    fetchDirectoryFieldsSuccess: (state, action: PayloadAction<{ directoryId: string; fields: DirectoryField[] }>) => {
      state.fields[action.payload.directoryId] = action.payload.fields;
      state.fieldsLoading[action.payload.directoryId] = false;
      state.fieldsError[action.payload.directoryId] = null;
    },
    fetchDirectoryFieldsFailure: (state, action: PayloadAction<{ directoryId: string; error: string }>) => {
      state.fieldsLoading[action.payload.directoryId] = false;
      state.fieldsError[action.payload.directoryId] = action.payload.error;
    },
    clearDirectoryFields: (state) => {
      state.fields = {};
      state.fieldsLoading = {};
      state.fieldsError = {};
    },
  },
});

export const {
  fetchDirectoriesStart,
  fetchDirectoriesSuccess,
  fetchDirectoriesFailure,
  deleteDirectoryStart,
  deleteDirectorySuccess,
  deleteDirectoryFailure,
  editDirectoryStart,
  editDirectorySuccess,
  editDirectoryFailure,
  createDirectoryStart,
  createDirectorySuccess,
  createDirectoryFailure,
  fetchDirectoryFieldsStart,
  fetchDirectoryFieldsSuccess,
  fetchDirectoryFieldsFailure,
  clearDirectoryFields,
} = directoriesSlice.actions;

export default directoriesSlice.reducer;
