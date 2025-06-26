import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company, CompaniesResponse } from '@/api/services/companies';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface Employee {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  status?: string;
  roles: { id: string; name: string; description?: string }[];
}

interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  pagination: Pagination | null;
  companyEmployees: Employee[];
  companyEmployeesLoading: boolean;
  companyEmployeesError: string | null;
  companyEmployeesSearch: string;
  companyEmployeesPage: number;
  companyEmployeesLimit: number;
  companyEmployeesPagination: Pagination | null;
}

const initialState: CompaniesState = {
  companies: [],
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  pagination: null,
  companyEmployees: [],
  companyEmployeesLoading: false,
  companyEmployeesError: null,
  companyEmployeesSearch: '',
  companyEmployeesPage: 1,
  companyEmployeesLimit: 10,
  companyEmployeesPagination: null,
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    fetchCompaniesStart(state, action: PayloadAction<{ page?: number; limit?: number } | undefined>) {
      state.loading = true;
      state.error = null;
      if (action.payload?.page !== undefined) state.page = action.payload.page;
      if (action.payload?.limit !== undefined) state.limit = action.payload.limit;
    },
    fetchCompaniesSuccess(state, action: PayloadAction<CompaniesResponse>) {
      state.loading = false;
      state.companies = action.payload.companies;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchCompaniesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addCompanyStart(state) {
      state.loading = true;
      state.error = null;
    },
    addCompanySuccess(state, action: PayloadAction<Company>) {
      state.loading = false;
      state.companies.unshift(action.payload);
      state.error = null;
    },
    addCompanyFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    editCompanyStart(state) {
      state.loading = true;
      state.error = null;
    },
    editCompanySuccess(state, action: PayloadAction<Company>) {
      state.loading = false;
      state.companies = state.companies.map(c => c.id === action.payload.id ? action.payload : c);
      state.error = null;
    },
    editCompanyFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteCompanyStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteCompanySuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.companies = state.companies.filter(c => c.id !== action.payload);
      state.error = null;
    },
    deleteCompanyFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setCompaniesPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setCompaniesLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },
    setCompanyEmployeesSearch(state, action: PayloadAction<string>) {
      state.companyEmployeesSearch = action.payload;
      state.companyEmployeesPage = 1;
    },
    setCompanyEmployeesPage(state, action: PayloadAction<number>) {
      state.companyEmployeesPage = action.payload;
    },
    setCompanyEmployeesLimit(state, action: PayloadAction<number>) {
      state.companyEmployeesLimit = action.payload;
      state.companyEmployeesPage = 1;
    },
    fetchCompanyEmployeesStart(state, action: PayloadAction<{ companyId: string; page?: number; limit?: number; search?: string }>) {
      state.companyEmployeesLoading = true;
      state.companyEmployeesError = null;
      state.companyEmployees = [];
      if (action.payload.search !== undefined) state.companyEmployeesSearch = action.payload.search;
      if (action.payload.page !== undefined) state.companyEmployeesPage = action.payload.page;
      if (action.payload.limit !== undefined) state.companyEmployeesLimit = action.payload.limit;
    },
    fetchCompanyEmployeesSuccess(state, action: PayloadAction<{ employees: Employee[]; pagination: Pagination }>) {
      state.companyEmployeesLoading = false;
      state.companyEmployees = action.payload.employees;
      state.companyEmployeesPagination = action.payload.pagination;
      state.companyEmployeesError = null;
    },
    fetchCompanyEmployeesFailure(state, action: PayloadAction<string>) {
      state.companyEmployeesLoading = false;
      state.companyEmployeesError = action.payload;
    },
  },
});

export const {
  fetchCompaniesStart, fetchCompaniesSuccess, fetchCompaniesFailure,
  addCompanyStart, addCompanySuccess, addCompanyFailure,
  editCompanyStart, editCompanySuccess, editCompanyFailure,
  deleteCompanyStart, deleteCompanySuccess, deleteCompanyFailure,
  setCompaniesPage, setCompaniesLimit,
  fetchCompanyEmployeesStart, fetchCompanyEmployeesSuccess, fetchCompanyEmployeesFailure,
  setCompanyEmployeesSearch, setCompanyEmployeesPage, setCompanyEmployeesLimit
} = companiesSlice.actions;
export default companiesSlice.reducer; 