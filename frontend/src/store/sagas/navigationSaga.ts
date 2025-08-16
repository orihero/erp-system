import { takeLatest, put, call, Effect } from 'redux-saga/effects';
import { setCurrentModule } from '../slices/navigationSlice';
import { usersService } from '../../api/services/users';
import { setNavigation } from '../slices/navigationSlice';

function* handleModuleChange(action: ReturnType<typeof setCurrentModule>): Generator<Effect, void, any> {
  try {
    // Refetch navigation with the new module context
    const navigation = yield call(usersService.getNavigation, { moduleId: action.payload.id });
    yield put(setNavigation(navigation));
  } catch (error) {
    console.error('Error refetching navigation for module change:', error);
  }
}

export function* navigationSaga() {
  yield takeLatest(setCurrentModule.type, handleModuleChange);
}
