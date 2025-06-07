import { call, put, takeLatest, select } from 'redux-saga/effects';
import { companiesApi } from '@/api/services/companies';
import {
  fetchCompaniesStart, fetchCompaniesSuccess, fetchCompaniesFailure,
  addCompanyStart, addCompanySuccess, addCompanyFailure,
  editCompanyStart, editCompanySuccess, editCompanyFailure,
  deleteCompanyStart, deleteCompanySuccess, deleteCompanyFailure,
  fetchCompanyEmployeesStart, fetchCompanyEmployeesSuccess, fetchCompanyEmployeesFailure
} from '../slices/companiesSlice';
import { showNotification } from '../slices/notificationSlice';
import { RootState } from '../index';
import { PayloadAction } from '@reduxjs/toolkit';

function* fetchCompaniesSaga(action: any) {
  try {
    let page, limit;
    if (action.payload) {
      page = action.payload.page;
      limit = action.payload.limit;
    } else {
      const state: RootState = yield select();
      page = state.companies.page;
      limit = state.companies.limit;
    }
    const response = yield call(companiesApi.getCompanies, { page, limit });
    yield put(fetchCompaniesSuccess(response.data));
  } catch (error: any) {
    yield put(fetchCompaniesFailure(error.message || 'Failed to fetch companies'));
    yield put(showNotification({ message: error.message || 'Failed to fetch companies', type: 'error' }));
  }
}

function* addCompanySaga(action: any) {
  try {
    const response = yield call(companiesApi.addCompany, action.payload);
    yield put(addCompanySuccess(response.data));
    yield put(showNotification({ message: 'Company added successfully', type: 'success' }));
  } catch (error: any) {
    yield put(addCompanyFailure(error.message || 'Failed to add company'));
    yield put(showNotification({ message: error.message || 'Failed to add company', type: 'error' }));
  }
}

function* editCompanySaga(action: any) {
  try {
    const { id, data } = action.payload;
    const response = yield call(companiesApi.editCompany, id, data);
    yield put(editCompanySuccess(response.data));
    yield put(showNotification({ message: 'Company updated successfully', type: 'success' }));
  } catch (error: any) {
    yield put(editCompanyFailure(error.message || 'Failed to edit company'));
    yield put(showNotification({ message: error.message || 'Failed to edit company', type: 'error' }));
  }
}

function* deleteCompanySaga(action: any) {
  try {
    yield call(companiesApi.deleteCompany, action.payload);
    yield put(deleteCompanySuccess(action.payload));
    yield put(showNotification({ message: 'Company deleted successfully', type: 'success' }));
  } catch (error: any) {
    yield put(deleteCompanyFailure(error.message || 'Failed to delete company'));
    yield put(showNotification({ message: error.message || 'Failed to delete company', type: 'error' }));
  }
}

function* fetchCompanyEmployeesSaga(action: PayloadAction<{ companyId: string; page?: number; limit?: number; search?: string }>) {
  try {
    const { companyId, page = 1, limit = 10, search = '' } = action.payload;
    const response = yield call(companiesApi.getCompanyEmployees, companyId, { page, limit, search });
    yield put(fetchCompanyEmployeesSuccess({ employees: response.data.employees, pagination: response.data.pagination }));
  } catch (error: any) {
    yield put(fetchCompanyEmployeesFailure(error.message || 'Failed to fetch employees'));
    yield put(showNotification({ message: error.message || 'Failed to fetch employees', type: 'error' }));
  }
}

export function* companiesSaga() {
  yield takeLatest(fetchCompaniesStart.type, fetchCompaniesSaga);
  yield takeLatest(addCompanyStart.type, addCompanySaga);
  yield takeLatest(editCompanyStart.type, editCompanySaga);
  yield takeLatest(deleteCompanyStart.type, deleteCompanySaga);
  yield takeLatest(fetchCompanyEmployeesStart.type, fetchCompanyEmployeesSaga);
} 