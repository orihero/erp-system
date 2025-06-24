import { takeLatest, call, put } from 'redux-saga/effects';
import { rolesApi, type UserRole } from '@/api/services/roles';
import {
  fetchRolesStart, fetchRolesSuccess, fetchRolesFailure,
  createRoleStart, createRoleSuccess, createRoleFailure,
  updateRoleStart, updateRoleSuccess, updateRoleFailure,
  deleteRoleStart, deleteRoleSuccess, deleteRoleFailure
} from '../slices/rolesSlice';
import { PayloadAction } from '@reduxjs/toolkit';

function* fetchRolesSaga(): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(rolesApi.getAll)) as { data: UserRole[] };
    yield put(fetchRolesSuccess(response.data));
  } catch (error) {
    yield put(fetchRolesFailure(error instanceof Error ? error.message : 'Failed to fetch roles'));
  }
}

function* createRoleSaga(action: PayloadAction<{ name: string; description?: string }>): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(rolesApi.create, action.payload)) as { data: UserRole };
    yield put(createRoleSuccess(response.data));
  } catch (error) {
    yield put(createRoleFailure(error instanceof Error ? error.message : 'Failed to create role'));
  }
}

function* updateRoleSaga(action: PayloadAction<{ id: string; data: { name?: string; description?: string } }>): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(rolesApi.update, action.payload.id, action.payload.data)) as { data: UserRole };
    yield put(updateRoleSuccess(response.data));
  } catch (error) {
    yield put(updateRoleFailure(error instanceof Error ? error.message : 'Failed to update role'));
  }
}

function* deleteRoleSaga(action: PayloadAction<string>): Generator<unknown, void, unknown> {
  try {
    yield call(rolesApi.delete, action.payload);
    yield put(deleteRoleSuccess(action.payload));
  } catch (error) {
    yield put(deleteRoleFailure(error instanceof Error ? error.message : 'Failed to delete role'));
  }
}

export function* rolesSaga() {
  yield takeLatest(fetchRolesStart.type, fetchRolesSaga);
  yield takeLatest(createRoleStart.type, createRoleSaga);
  yield takeLatest(updateRoleStart.type, updateRoleSaga);
  yield takeLatest(deleteRoleStart.type, deleteRoleSaga);
} 