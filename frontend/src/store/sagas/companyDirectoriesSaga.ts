import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { directoriesApi, type Directory } from '@/api/services/directories';
import { companyDirectoriesApi, type CompanyDirectoryResponse } from '@/api/services/companyDirectories';
import {
  fetchCompanyDirectories,
  fetchCompanyDirectoriesSuccess,
  fetchCompanyDirectoriesFailure,
  toggleCompanyDirectory,
  toggleCompanyDirectorySuccess,
  toggleCompanyDirectoryFailure
} from '../slices/companyDirectoriesSlice';

function* fetchCompanyDirectoriesSaga(action: PayloadAction<{ companyId: string }>): Generator {
  try {
    const [allDirsRes, companyDirsRes] = yield call([Promise, 'all'], [
      directoriesApi.getAll(),
      companyDirectoriesApi.getCompanyDirectories(action.payload.companyId)
    ]);

    // Merge the data to show all directories with their enabled status
    const mergedDirectories = allDirsRes.data.map((dir: Directory) => {
      const companyDir = companyDirsRes.data.find((cd: CompanyDirectoryResponse) => cd.directory_id === dir.id);
      return {
        ...dir,
        is_enabled: !!companyDir,
        company_directory_id: companyDir?.id // Store the company directory ID for later use
      };
    });

    const companyDirectories = companyDirsRes.data.map((entry: CompanyDirectoryResponse) => ({
      id: entry.directory.id,
      name: entry.directory.name,
      icon_name: entry.directory.icon_name,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      is_enabled: true,
      company_directory_id: entry.id
    }));

    yield put(fetchCompanyDirectoriesSuccess({
      allDirectories: mergedDirectories,
      companyDirectories
    }));
  } catch (error) {
    yield put(fetchCompanyDirectoriesFailure(error instanceof Error ? error.message : 'Failed to fetch directories'));
  }
}

function* toggleCompanyDirectorySaga(action: PayloadAction<{
  companyId: string;
  directory: Directory & { company_directory_id?: string };
  isEnabled: boolean;
}>): Generator {
  try {
    const { companyId, directory, isEnabled } = action.payload;

    if (isEnabled) {
      // Add directory to company
      yield call(companyDirectoriesApi.addDirectoryToCompany, companyId, directory.id, []);
    } else {
      // Remove directory from company using company_directory_id
      if (!directory.company_directory_id) {
        throw new Error('Company directory ID not found');
      }
      yield call(companyDirectoriesApi.removeDirectoryFromCompany, directory.company_directory_id);
    }

    // Refetch company directories after successful toggle
    yield put(fetchCompanyDirectories({ companyId }));

    yield put(toggleCompanyDirectorySuccess({
      directory,
      isEnabled
    }));
  } catch (error) {
    yield put(toggleCompanyDirectoryFailure({
      directoryId: action.payload.directory.id,
      error: error instanceof Error ? error.message : 'Failed to toggle directory'
    }));
  }
}

export function* companyDirectoriesSaga() {
  yield takeLatest(fetchCompanyDirectories.type, fetchCompanyDirectoriesSaga);
  yield takeLatest(toggleCompanyDirectory.type, toggleCompanyDirectorySaga);
} 