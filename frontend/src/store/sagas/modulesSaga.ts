import type { Module } from '@/api/services/modules';
import { modulesApi } from '@/api/services/modules';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchCompanyModuleDirectoriesStart } from '../slices/companyModuleDirectoriesSlice';
import {
  fetchModulesFailure,
  fetchModulesStart,
  fetchModulesSuccess,
  toggleModuleFailure,
  toggleModuleStart,
  updateModuleFailure,
  updateModuleStart,
  updateModuleSuccess
} from '../slices/modulesSlice';

interface ToggleModulePayload {
  companyId: string;
  moduleId: string;
}

interface UpdateModulePayload {
  moduleId: string;
  data: Partial<Module>;
}

// Saga for company-specific modules (ModulesTab)
function* fetchCompanyModules(action: PayloadAction<string>): Generator {
  try {
    const [allModulesRes, companyModulesRes] = yield call([Promise, 'all'], [
      modulesApi.getAll(),
      modulesApi.getCompanyModules(action.payload)
    ]);

    // Merge the data to show all modules with their enabled status
    const mergedModules = allModulesRes.data.map((module: Module) => {
      const companyModule = companyModulesRes.data.find((cm: Module) => cm.id === module.id);
      return {
        ...module,
        is_enabled: companyModule?.is_enabled || false
      };
    });

    yield put(fetchModulesSuccess(mergedModules));
  } catch (error) {
    console.error('Error fetching company modules:', error);
    yield put(fetchModulesFailure(error instanceof Error ? error.message : 'Failed to load modules'));
  }
}

// Saga for main modules page
function* fetchAllModules(): Generator {
  try {
    const response = yield call(modulesApi.getAll);
    yield put(fetchModulesSuccess(response.data));
  } catch (error) {
    console.error('Error fetching all modules:', error);
    yield put(fetchModulesFailure(error instanceof Error ? error.message : 'Failed to load modules'));
  }
}

function* toggleModule(action: PayloadAction<ToggleModulePayload>): Generator {
  const { companyId, moduleId } = action.payload;
  try {
    // First toggle the module
    yield call(modulesApi.toggleModule, companyId, moduleId);
    
    // Then trigger a refresh of the company module directories data using the correct action
    yield put(fetchCompanyModuleDirectoriesStart(companyId));
  } catch (error) {
    console.error('Error toggling module:', error);
    yield put(toggleModuleFailure({ 
      moduleId, 
      error: error instanceof Error ? error.message : 'Failed to toggle module' 
    }));
  }
}

function* updateModule(action: PayloadAction<UpdateModulePayload>): Generator {
  const { moduleId, data } = action.payload;
  try {
    const response = yield call(modulesApi.update, moduleId, data);
    yield put(updateModuleSuccess(response.data));
  } catch (error) {
    console.error('Error updating module:', error);
    yield put(updateModuleFailure({ 
      moduleId, 
      error: error instanceof Error ? error.message : 'Failed to update module' 
    }));
  }
}

export function* modulesSaga() {
  yield takeLatest(fetchModulesStart.type, function* (action: PayloadAction<string | undefined>) {
    if (action.payload) {
      yield* fetchCompanyModules(action as PayloadAction<string>);
    } else {
      yield* fetchAllModules();
    }
  });
  yield takeLatest(toggleModuleStart.type, toggleModule);
  yield takeLatest(updateModuleStart.type, updateModule);
}
