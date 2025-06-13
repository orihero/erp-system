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
import appStateReducer from "./slices/appStateSlice";
import companyModuleDirectoriesReducer from "./slices/companyModuleDirectoriesSlice";
import { authSaga } from "./sagas/authSaga";
import { usersSaga } from "./sagas/usersSaga";
import { directoriesSaga } from "./sagas/directoriesSaga";
import { companiesSaga } from "./sagas/companiesSaga";
import { companyDirectoriesSaga } from "./sagas/companyDirectoriesSaga";
import { modulesSaga } from "./sagas/modulesSaga";
import { rolesSaga } from "./sagas/rolesSaga";
import { companyModuleDirectoriesSaga } from "./sagas/companyModuleDirectoriesSaga";

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
    appState: appStateReducer,
    companyModuleDirectories: companyModuleDirectoriesReducer,
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
    companyModuleDirectoriesSaga(),
  ]);
}

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
