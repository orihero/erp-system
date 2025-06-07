import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  company_id: string;
  firstname?: string;
  lastname?: string;
  company?: { name?: string };
  roles?: string[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  search: string;
  pagination: Pagination | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  page: 1,
  limit: 50,
  search: '',
  pagination: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsersStart(state, action: PayloadAction<{ page?: number; limit?: number; search?: string } | undefined>) {
      state.loading = true;
      state.error = null;
      if (action.payload?.page !== undefined) state.page = action.payload.page;
      if (action.payload?.limit !== undefined) state.limit = action.payload.limit;
      if (action.payload?.search !== undefined) state.search = action.payload.search;
    },
    fetchUsersSuccess(state, action: PayloadAction<{ users: User[]; pagination: Pagination }>) {
      state.loading = false;
      state.users = action.payload.users;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchUsersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setUsersPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setUsersSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    // Delete user actions
    deleteUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.users = state.users.filter(user => user.id !== action.payload);
      state.error = null;
    },
    deleteUserFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    // Edit user actions
    editUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    editUserSuccess(state, action: PayloadAction<User>) {
      state.loading = false;
      state.users = state.users.map(user => user.id === action.payload.id ? action.payload : user);
      state.error = null;
    },
    editUserFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure, setUsersPage, setUsersSearch, deleteUserStart, deleteUserSuccess, deleteUserFailure, editUserStart, editUserSuccess, editUserFailure } = usersSlice.actions;
export default usersSlice.reducer; 