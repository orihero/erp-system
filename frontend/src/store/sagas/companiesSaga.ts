import { call, put, takeLatest, select } from 'redux-saga/effects';
import { companiesApi } from '@/api/services/companies';
import {
  fetchCompaniesStart, fetchCompaniesSuccess, fetchCompaniesFailure,
  addCompanyStart, addCompanySuccess, addCompanyFailure,
  editCompanyStart, editCompanySuccess, editCompanyFailure,
  deleteCompanyStart, deleteCompanySuccess, deleteCompanyFailure,
  fetchCompanyEmployeesStart, fetchCompanyEmployeesSuccess, fetchCompanyEmployeesFailure,
  editEmployeeStart, editEmployeeSuccess, editEmployeeFailure,
  deleteEmployeeStart, deleteEmployeeSuccess, deleteEmployeeFailure
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

function* editEmployeeSaga(action: PayloadAction<{ id: string; data: Partial<{ firstname: string; lastname: string; email: string; status: string; roles: string[] }> }>) {
  try {
    const { id, data } = action.payload;
    const response = yield call(companiesApi.editEmployee, id, data);
    yield put(editEmployeeSuccess(response.data));
    yield put(showNotification({ message: 'Employee updated successfully', type: 'success' }));
  } catch (error: any) {
    yield put(editEmployeeFailure(error.message || 'Failed to edit employee'));
    yield put(showNotification({ message: error.message || 'Failed to edit employee', type: 'error' }));
  }
}

function* deleteEmployeeSaga(action: PayloadAction<string>) {
  try {
    yield call(companiesApi.deleteEmployee, action.payload);
    yield put(deleteEmployeeSuccess(action.payload));
    yield put(showNotification({ message: 'Employee deleted successfully', type: 'success' }));
  } catch (error: any) {
    yield put(deleteEmployeeFailure(error.message || 'Failed to delete employee'));
    yield put(showNotification({ message: error.message || 'Failed to delete employee', type: 'error' }));
  }
}

export function* companiesSaga() {
  yield takeLatest(fetchCompaniesStart.type, fetchCompaniesSaga);
  yield takeLatest(addCompanyStart.type, addCompanySaga);
  yield takeLatest(editCompanyStart.type, editCompanySaga);
  yield takeLatest(deleteCompanyStart.type, deleteCompanySaga);
  yield takeLatest(fetchCompanyEmployeesStart.type, fetchCompanyEmployeesSaga);
  yield takeLatest(editEmployeeStart.type, editEmployeeSaga);
  yield takeLatest(deleteEmployeeStart.type, deleteEmployeeSaga);
} 