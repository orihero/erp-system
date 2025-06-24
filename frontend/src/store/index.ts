import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all } from "redux-saga/effects";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import usersReducer from "./slices/usersSlice";
import directoriesReducer from "./slices/directoriesSlice";
import companiesReducer from "./slices/companiesSlice";
import companyDirectoriesReducer from "./slices/companyDirectoriesSlice";
import modulesReducer from "./slices/modulesSlice";
import rolesReducer from "./slices/rolesSlice";
import permissionsReducer from "./slices/permissionsSlice";
import appStateReducer from "./slices/appStateSlice";
import companyModuleDirectoriesReducer from "./slices/companyModuleDirectoriesSlice";
import directoryRecordsReducer from "./slices/directoryRecordsSlice";
import { authSaga } from "./sagas/authSaga";
import { usersSaga } from "./sagas/usersSaga";
import { directoriesSaga } from "./sagas/directoriesSaga";
import { companiesSaga } from "./sagas/companiesSaga";
import { companyDirectoriesSaga } from "./sagas/companyDirectoriesSaga";
import { modulesSaga } from "./sagas/modulesSaga";
import { rolesSaga } from "./sagas/rolesSaga";
import { permissionsSaga } from "./sagas/permissionsSaga";
import { companyModuleDirectoriesSaga } from "./sagas/companyModuleDirectoriesSaga";
import directoryRecordsSaga from "./sagas/directoryRecordsSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    users: usersReducer,
    directories: directoriesReducer,
    companies: companiesReducer,
    companyDirectories: companyDirectoriesReducer,
    modules: modulesReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    appState: appStateReducer,
    companyModuleDirectories: companyModuleDirectoriesReducer,
    directoryRecords: directoryRecordsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

function* rootSaga() {
  yield all([
    authSaga(),
    usersSaga(),
    directoriesSaga(),
    companiesSaga(),
    companyDirectoriesSaga(),
    modulesSaga(),
    rolesSaga(),
    permissionsSaga(),
    companyModuleDirectoriesSaga(),
    directoryRecordsSaga(),
  ]);
}

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
