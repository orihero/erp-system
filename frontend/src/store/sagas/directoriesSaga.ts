import { takeLatest, put, call } from 'redux-saga/effects';
import { directoriesApi } from '../../api/services/directories';
import {
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
} from '../slices/directoriesSlice';
import { PayloadAction } from '@reduxjs/toolkit';
import { Directory, DirectoryField } from '../../api/services/directories';

function* handleFetchDirectories(): Generator<unknown, void, { data: Directory[] }> {
  try {
    const response = yield call(directoriesApi.getAll);
    yield put(fetchDirectoriesSuccess(response.data));
  } catch (error) {
    yield put(fetchDirectoriesFailure(error instanceof Error ? error.message : 'Failed to fetch directories'));
  }
}

function* handleDeleteDirectory(action: PayloadAction<string>): Generator<unknown, void, void> {
  try {
    yield call(directoriesApi.deleteDirectory, action.payload);
    yield put(deleteDirectorySuccess(action.payload));
  } catch (error) {
    yield put(deleteDirectoryFailure(error instanceof Error ? error.message : 'Failed to delete directory'));
  }
}

function* handleEditDirectory(action: PayloadAction<{ id: string; data: Partial<Directory> & { fields?: DirectoryField[] } }>): Generator<unknown, void, { data: Directory }> {
  try {
    const response = yield call(directoriesApi.updateDirectory, action.payload.id, action.payload.data);
    yield put(editDirectorySuccess(response.data));
  } catch (error) {
    yield put(editDirectoryFailure(error instanceof Error ? error.message : 'Failed to edit directory'));
  }
}

function* handleCreateDirectory(action: PayloadAction<Omit<Directory, 'id' | 'created_at' | 'updated_at'> & { fields?: DirectoryField[] }>): Generator<unknown, void, { data: Directory }> {
  try {
    const response = yield call(directoriesApi.createDirectory, action.payload);
    yield put(createDirectorySuccess(response.data));
  } catch (error) {
    yield put(createDirectoryFailure(error instanceof Error ? error.message : 'Failed to create directory'));
  }
}

function* handleFetchDirectoryFields(action: PayloadAction<string>): Generator<unknown, void, { data: DirectoryField[] }> {
  try {
    const response = yield call(directoriesApi.getDirectoryFields, action.payload);
    yield put(fetchDirectoryFieldsSuccess({ directoryId: action.payload, fields: response.data }));
  } catch (error) {
    yield put(fetchDirectoryFieldsFailure({ directoryId: action.payload, error: error instanceof Error ? error.message : 'Failed to fetch directory fields' }));
  }
}

export function* directoriesSaga() {
  yield takeLatest(fetchDirectoriesStart.type, handleFetchDirectories);
  yield takeLatest(deleteDirectoryStart.type, handleDeleteDirectory);
  yield takeLatest(editDirectoryStart.type, handleEditDirectory);
  yield takeLatest(createDirectoryStart.type, handleCreateDirectory);
  yield takeLatest(fetchDirectoryFieldsStart.type, handleFetchDirectoryFields);
}
