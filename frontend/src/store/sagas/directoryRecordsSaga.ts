import { takeEvery, call, put } from "redux-saga/effects";
import { directoriesApi, DirectoryEntry } from "@/api/services/directories";
import {
  fetchDirectoryRecords,
  fetchDirectoryRecordsSuccess,
  fetchDirectoryRecordsFailure,
  addDirectoryRecord,
  addDirectoryRecordSuccess,
  addDirectoryRecordFailure,
  updateDirectoryRecord,
  updateDirectoryRecordSuccess,
  updateDirectoryRecordFailure,
  deleteDirectoryRecord,
  deleteDirectoryRecordSuccess,
  deleteDirectoryRecordFailure,
} from "../slices/directoryRecordsSlice";

function* fetchDirectoryRecordsSaga(
  action: ReturnType<typeof fetchDirectoryRecords>
): Generator<any, void, unknown> {
  try {
    console.log("====================================");
    console.log("FETCHING DIRECTORY RECORDS");
    console.log("====================================");
    const { companyDirectoryId, page, limit, search, filters } = action.payload;
    const rawResponse: any = yield call(
      directoriesApi.getDirectoryEntries,
      companyDirectoryId,
      { page, limit, search, filters }
    );
    console.log("====================================");
    console.log("DIRECTORY RECORDS", rawResponse.data.records);
    console.log("====================================");
    const response = {
      entries: rawResponse.data.records as DirectoryEntry[],
      pagination: rawResponse.pagination as {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      },
    };
    yield put(
      fetchDirectoryRecordsSuccess({
        records: response.entries,
        pagination: response.pagination,
      })
    );
  } catch (error: any) {
    yield put(
      fetchDirectoryRecordsFailure(
        error.message || "Failed to fetch directory records"
      )
    );
  }
}

function* addDirectoryRecordSaga(
  action: ReturnType<typeof addDirectoryRecord>
): Generator<any, void, unknown> {
  try {
    const { companyDirectoryId, values } = action.payload;
    const rawResponse: any = yield call(
      directoriesApi.createDirectoryEntry,
      companyDirectoryId,
      values
    );
    const response = rawResponse as DirectoryEntry;
    yield put(addDirectoryRecordSuccess(response));
  } catch (error: any) {
    yield put(
      addDirectoryRecordFailure(
        error.message || "Failed to add directory record"
      )
    );
  }
}

function* updateDirectoryRecordSaga(
  action: ReturnType<typeof updateDirectoryRecord>
): Generator<any, void, unknown> {
  try {
    const { companyDirectoryId, recordId, values } = action.payload;
    const rawResponse: any = yield call(
      directoriesApi.updateDirectoryEntry,
      companyDirectoryId,
      recordId,
      values
    );
    const response = rawResponse as DirectoryEntry;
    yield put(updateDirectoryRecordSuccess(response));
  } catch (error: any) {
    yield put(
      updateDirectoryRecordFailure({
        recordId: action.payload.recordId,
        error: error.message || "Failed to update directory record",
      })
    );
  }
}

function* deleteDirectoryRecordSaga(
  action: ReturnType<typeof deleteDirectoryRecord>
): Generator<any, void, unknown> {
  try {
    const { companyDirectoryId, recordId } = action.payload;
    yield call(
      directoriesApi.deleteDirectoryEntry,
      companyDirectoryId,
      recordId
    );
    yield put(deleteDirectoryRecordSuccess(recordId));
  } catch (error: any) {
    yield put(
      deleteDirectoryRecordFailure({
        recordId: action.payload.recordId,
        error: error.message || "Failed to delete directory record",
      })
    );
  }
}

export default function* directoryRecordsSaga(): Generator<any, void, unknown> {
  yield takeEvery(fetchDirectoryRecords.type, fetchDirectoryRecordsSaga);
  yield takeEvery(addDirectoryRecord.type, addDirectoryRecordSaga);
  yield takeEvery(updateDirectoryRecord.type, updateDirectoryRecordSaga);
  yield takeEvery(deleteDirectoryRecord.type, deleteDirectoryRecordSaga);
}
