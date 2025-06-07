import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, editUserStart, editUserSuccess, editUserFailure, User } from '../slices/usersSlice';
import { PayloadAction } from '@reduxjs/toolkit';
import { usersService, UsersResponse } from '../../api/services/users';

interface FetchUsersPayload {
  page?: number;
  limit?: number;
  search?: string;
}

function* handleFetchUsers(action: PayloadAction<FetchUsersPayload | undefined>): Generator<unknown, void, unknown> {
  try {
    const { page = 1, limit = 10, search = '' } = action.payload || {};
    const response = (yield call(usersService.getUsers, { page, limit, search })) as UsersResponse;
    const usersList = Array.isArray(response.users) ? response.users : [];
    const pagination = response.pagination || { total: 0, page, limit, total_pages: 1 };
    yield put(fetchUsersSuccess({ users: usersList, pagination }));
  } catch (error) {
    yield put(fetchUsersFailure(error instanceof Error ? error.message : 'Failed to fetch users'));
  }
}

function* handleDeleteUser(action: PayloadAction<string>): Generator<unknown, void, unknown> {
  try {
    yield call(usersService.deleteUser, action.payload);
    yield put(deleteUserSuccess(action.payload));
  } catch (error) {
    yield put(deleteUserFailure(error instanceof Error ? error.message : 'Failed to delete user'));
  }
}

function* handleEditUser(action: PayloadAction<{ id: string; data: Partial<User> }>): Generator<unknown, void, unknown> {
  try {
    const updatedUser = (yield call(usersService.editUser, action.payload.id, action.payload.data)) as User;
    yield put(editUserSuccess(updatedUser));
  } catch (error) {
    yield put(editUserFailure(error instanceof Error ? error.message : 'Failed to edit user'));
  }
}

export function* usersSaga() {
  yield takeLatest(fetchUsersStart.type, handleFetchUsers);
  yield takeLatest(deleteUserStart.type, handleDeleteUser);
  yield takeLatest(editUserStart.type, handleEditUser);
} 