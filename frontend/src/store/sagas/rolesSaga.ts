import { takeLatest, call, put } from 'redux-saga/effects';
import { rolesApi } from '@/api/services/roles';
import { fetchRolesStart, fetchRolesSuccess, fetchRolesFailure } from '../slices/rolesSlice';

function* fetchRolesSaga(): Generator<any, void, any> {
  try {
    const response = yield call(rolesApi.getAll);
    yield put(fetchRolesSuccess(response.data));
  } catch (error) {
    yield put(fetchRolesFailure(error instanceof Error ? error.message : 'Failed to fetch roles'));
  }
}

export function* rolesSaga() {
  yield takeLatest(fetchRolesStart.type, fetchRolesSaga);
} 