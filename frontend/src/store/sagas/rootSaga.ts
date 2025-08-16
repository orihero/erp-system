import { all } from "redux-saga/effects";
import { authSaga } from "./authSaga";
import { usersSaga } from "./usersSaga";
import { directoriesSaga } from "./directoriesSaga";
import { companiesSaga } from "./companiesSaga";
import { companyDirectoriesSaga } from "./companyDirectoriesSaga";
import directoryRecordsSaga from "./directoryRecordsSaga";
import { navigationSaga } from "./navigationSaga";

export function* rootSaga() {
  yield all([
    authSaga(),
    usersSaga(),
    directoriesSaga(),
    companiesSaga(),
    companyDirectoriesSaga(),
    directoryRecordsSaga(),
    navigationSaga(),
  ]);
}
