import { call, put, takeLatest } from 'redux-saga/effects';
import { permissionsApi } from '@/api/services/permissions';
import type { Permission } from '@/api/services/permissions';
import {
  fetchPermissionsStart,
  fetchPermissionsSuccess,
  fetchPermissionsFailure,
  createPermissionStart,
  createPermissionSuccess,
  createPermissionFailure,
  updatePermissionStart,
  updatePermissionSuccess,
  updatePermissionFailure,
  deletePermissionStart,
  deletePermissionSuccess,
  deletePermissionFailure,
  fetchRolePermissionsStart,
  fetchRolePermissionsSuccess,
  fetchRolePermissionsFailure,
  assignPermissionToRoleStart,
  assignPermissionToRoleSuccess,
  assignPermissionToRoleFailure,
  removePermissionFromRoleStart,
  removePermissionFromRoleSuccess,
  removePermissionFromRoleFailure,
} from '../slices/permissionsSlice';

function* fetchPermissionsSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(permissionsApi.getAll);
    yield put(fetchPermissionsSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch permissions';
    yield put(fetchPermissionsFailure(errorMessage));
  }
}

function* createPermissionSaga(action: ReturnType<typeof createPermissionStart>): Generator<any, void, any> {
  try {
    const response: any = yield call(permissionsApi.create, action.payload);
    yield put(createPermissionSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create permission';
    yield put(createPermissionFailure(errorMessage));
  }
}

function* updatePermissionSaga(action: ReturnType<typeof updatePermissionStart>): Generator<any, void, any> {
  try {
    const { id, data } = action.payload;
    const response: any = yield call(permissionsApi.update, id, data);
    yield put(updatePermissionSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update permission';
    yield put(updatePermissionFailure(errorMessage));
  }
}

function* deletePermissionSaga(action: ReturnType<typeof deletePermissionStart>): Generator<any, void, any> {
  try {
    yield call(permissionsApi.delete, action.payload);
    yield put(deletePermissionSuccess(action.payload));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete permission';
    yield put(deletePermissionFailure(errorMessage));
  }
}

function* fetchRolePermissionsSaga(action: ReturnType<typeof fetchRolePermissionsStart>): Generator<any, void, any> {
  try {
    const response: Response = yield call(fetch, `/api/roles/${action.payload}/permissions`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch role permissions');
    const data: any = yield call([response, 'json']);
    yield put(fetchRolePermissionsSuccess(data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch role permissions';
    yield put(fetchRolePermissionsFailure(errorMessage));
  }
}

function* assignPermissionToRoleSaga(action: ReturnType<typeof assignPermissionToRoleStart>): Generator<any, void, any> {
  try {
    const { roleId, data } = action.payload;
    const response: any = yield call(permissionsApi.assignToRole, roleId, data);
    yield put(assignPermissionToRoleSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to assign permission to role';
    yield put(assignPermissionToRoleFailure(errorMessage));
  }
}

function* removePermissionFromRoleSaga(action: ReturnType<typeof removePermissionFromRoleStart>): Generator<any, void, any> {
  try {
    const { roleId, permissionId } = action.payload;
    yield call(permissionsApi.removeFromRole, roleId, permissionId);
    yield put(removePermissionFromRoleSuccess({ roleId, permissionId }));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove permission from role';
    yield put(removePermissionFromRoleFailure(errorMessage));
  }
}

export function* permissionsSaga() {
  yield takeLatest(fetchPermissionsStart.type, fetchPermissionsSaga);
  yield takeLatest(createPermissionStart.type, createPermissionSaga);
  yield takeLatest(updatePermissionStart.type, updatePermissionSaga);
  yield takeLatest(deletePermissionStart.type, deletePermissionSaga);
  yield takeLatest(fetchRolePermissionsStart.type, fetchRolePermissionsSaga);
  yield takeLatest(assignPermissionToRoleStart.type, assignPermissionToRoleSaga);
  yield takeLatest(removePermissionFromRoleStart.type, removePermissionFromRoleSaga);
} 