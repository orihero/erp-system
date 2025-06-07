import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './sagas/rootSaga';

import companyDirectoriesReducer from './slices/companyDirectoriesSlice';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import usersReducer from './slices/usersSlice';
import directoriesReducer from './slices/directoriesSlice';
import companiesReducer from './slices/companiesSlice';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    users: usersReducer,
    directories: directoriesReducer,
    companies: companiesReducer,
    companyDirectories: companyDirectoriesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware)
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 