import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { modulesApi, type Module } from "@/api/services/modules";
import {
  companyDirectoriesApi,
  type CompanyDirectoryResponse,
} from "@/api/services/companyDirectories";
import {
  fetchCompanyModuleDirectoriesStart,
  fetchCompanyModuleDirectoriesSuccess,
  fetchCompanyModuleDirectoriesFailure,
} from "../slices/companyModuleDirectoriesSlice";
import type { CompanyModuleDirectory } from "../slices/companyModuleDirectoriesSlice";

interface CompanyModule extends Module {
  is_enabled: boolean;
  company_module_id?: string;
}

function* fetchCompanyModuleDirectoriesSaga(
  action: PayloadAction<string>
): Generator {
  try {
    const companyId = action.payload;

    // Fetch all modules and company modules
    const [allModulesRes, companyModulesRes] = yield call(
      [Promise, "all"],
      [modulesApi.getAll(), modulesApi.getCompanyModules(companyId)]
    );

    console.log("company modules:", { companyModules: companyModulesRes.data });

    // Merge the data to show all modules with their enabled status
    const mergedModules = allModulesRes.data.map((module: Module) => {
      const companyModule = companyModulesRes.data.find(
        (cm: any) => cm.module && cm.module.id === module.id
      );
      return {
        ...module,
        is_enabled: companyModule?.is_enabled || false,
        company_module_id: companyModule?.id, // Store the company module ID for later use
      };
    });

    // Filter enabled modules and fetch their directories
    const enabledModules = mergedModules.filter(
      (module: CompanyModule) => module.is_enabled
    );
    const directoriesByModule: Record<string, CompanyModuleDirectory[]> = {};

    // Fetch directories for each enabled module
    for (const module of enabledModules) {
      try {
        const res = yield call(
          companyDirectoriesApi.getAll,
          companyId,
          module.company_module_id
        );

        directoriesByModule[module.id] = res.data.map(
          (entry: CompanyDirectoryResponse): CompanyModuleDirectory => ({
            id: entry.directory.id,
            name: entry.directory.name,
            icon_name: entry.directory.icon_name || "",
            created_at: entry.created_at,
            updated_at: entry.updated_at,
            is_enabled: true,
            company_directory_id: entry.id,
          })
        );
      } catch (error) {
        console.error(
          `Error fetching directories for module ${module.id}:`,
          error
        );
        directoriesByModule[module.id] = [];
      }
    }

    yield put(
      fetchCompanyModuleDirectoriesSuccess({
        modules: mergedModules,
        directoriesByModule,
      })
    );
  } catch (error) {
    console.error("Error in fetchCompanyModuleDirectoriesSaga:", error);
    yield put(
      fetchCompanyModuleDirectoriesFailure(
        error instanceof Error
          ? error.message
          : "Failed to fetch company module directories"
      )
    );
  }
}

export function* companyModuleDirectoriesSaga() {
  yield takeLatest(
    fetchCompanyModuleDirectoriesStart.type,
    fetchCompanyModuleDirectoriesSaga
  );
}
