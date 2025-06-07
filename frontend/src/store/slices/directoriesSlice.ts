import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Directory, DirectoryField } from '../../api/services/directories';

interface DirectoriesState {
  directories: Directory[];
  loading: boolean;
  error: string | null;
}

const initialState: DirectoriesState = {
  directories: [],
  loading: false,
  error: null,
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
    deleteDirectoryStart: (state, action: PayloadAction<string>) => {
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
    editDirectoryStart: (state, action: PayloadAction<{ id: string; data: Partial<Directory> & { fields?: DirectoryField[] } }>) => {
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
    createDirectoryStart: (state, action: PayloadAction<Omit<Directory, 'id' | 'created_at' | 'updated_at'> & { fields?: DirectoryField[] }>) => {
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
} = directoriesSlice.actions;

export default directoriesSlice.reducer; 