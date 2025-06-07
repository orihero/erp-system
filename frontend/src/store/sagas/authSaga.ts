import { takeLatest, put, call, Effect } from 'redux-saga/effects';
import { loginStart, loginSuccess, loginFailure, signupStart, signupSuccess, signupFailure } from '../slices/authSlice';
import { showNotification } from '../slices/notificationSlice';
import { authService, type LoginResponse, type User } from '../../api/services/auth.service';

function* handleLogin(action: ReturnType<typeof loginStart>): Generator<Effect, void, LoginResponse> {
  try {
    if (!action.payload) return;
    const { email, password, remember } = action.payload;
    const response = yield call(authService.login, { email, password });
    
    // Store token in appropriate storage
    if (remember) {
      localStorage.setItem('token', response.token);
    } else {
      sessionStorage.setItem('token', response.token);
    }
    
    yield put(loginSuccess(response));
    yield put(showNotification({ 
      message: `Welcome back, ${response.user.email}! You've successfully logged in.`,
      type: 'success'
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
    yield put(loginFailure(errorMessage));
    yield put(showNotification({ message: errorMessage, type: 'error' }));
  }
}

function* verifyToken(): Generator<Effect, void, User> {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      yield put(loginFailure('No token found'));
      return;
    }

    const user = yield call(authService.getProfile);
    yield put(loginSuccess({ user, token }));
  } catch (error) {
    // If token verification fails, clear the token
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    const errorMessage = error instanceof Error ? error.message : 'Session expired. Please login again.';
    yield put(loginFailure(errorMessage));
    yield put(showNotification({ message: errorMessage, type: 'error' }));
  }
}

function* handleSignup(action: ReturnType<typeof signupStart>): Generator<Effect, void, unknown> {
  try {
    const { email, password, company_name, employee_count } = action.payload;
    yield call(authService.register, {
      email,
      password,
      company_name,
      employee_count: parseInt(employee_count, 10)
    });
    
    yield put(signupSuccess());
    yield put(showNotification({ 
      message: `Welcome to ${company_name}! Your account has been created successfully. Please login to continue.`,
      type: 'success'
    }));
    window.location.href = '/login';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
    yield put(signupFailure(errorMessage));
    yield put(showNotification({ message: errorMessage, type: 'error' }));
  }
}

// Root saga that runs on app initialization
function* rootSaga(): Generator<Effect, void, unknown> {
  // First verify the token and fetch profile
  yield call(verifyToken);
  // Then start listening for login and signup actions
  yield takeLatest(loginStart.type, handleLogin);
  yield takeLatest(signupStart.type, handleSignup);
}

export function* authSaga() {
  yield rootSaga();
} 