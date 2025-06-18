import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import type { RootState } from './store';
import { store } from './store';
import Login from './pages/login/Login';
import Signup from './pages/signup/Signup';
import Dashboard from './pages/dashboard';
import Clients from './pages/clients';
import Directories from './pages/directories';
import DirectoryRecords from './pages/directories/DirectoryRecords';
import Companies from './pages/companies';
import Modules from './pages/modules/Modules';
import Reports from './pages/reports/Reports';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Layout from './components/Layout/Layout';
import CashierLayout from './components/Layout/CashierLayout';
import CompanyDetail from './pages/companies/CompanyDetail';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Module IDs
const INVENTORY_MODULE_ID = '550e8400-e29b-41d4-a716-446655440000';
const USERS_MODULE_ID = '550e8400-e29b-41d4-a716-446655440001';

// Import cashier pages
import CashierReceipts from './pages/cashier/Receipts';
import CashierBank from './pages/cashier/Bank';
import CashierReports from './pages/cashier/Reports';
import CashierDirectories from './pages/cashier/Directories';

const theme = createTheme({
  typography: {
    fontFamily: `'Outfit', 'Roboto', Arial, sans-serif`,
  },
});

const AppRoutes: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <div style={{ backgroundColor: '#eef2f5' }}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        {/* Protected Routes */}
        <Route element={
          <Layout>
            <Outlet />
          </Layout>
        }>
          <Route path="/" element={
            <PrivateRoute requiredPermissionType="view_dashboard">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
          </Route>

          <Route path="/users" element={
            <PrivateRoute requiredPermissionType="view_module" moduleId={USERS_MODULE_ID}>
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Modules />} />
          </Route>

          <Route path="/inventory" element={
            <PrivateRoute requiredPermissionType="view_module" moduleId={INVENTORY_MODULE_ID}>
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Modules />} />
          </Route>

          <Route path="/clients" element={
            <PrivateRoute requiredPermissionType="view_clients">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Clients />} />
          </Route>

          <Route path="/directories" element={
            <PrivateRoute requiredPermissionType="view_directories">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Directories />} />
          </Route>

          <Route path="/directories/:directoryId" element={
            <PrivateRoute requiredPermissionType="view_directories">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<DirectoryRecords />} />
          </Route>

          <Route path="/companies" element={
            <PrivateRoute requiredPermissionType="view_companies">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Companies />} />
          </Route>

          <Route path="/companies/:companyId" element={
            <PrivateRoute requiredPermissionType="view_companies">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CompanyDetail />} />
          </Route>

          <Route path="/modules" element={
            <PrivateRoute requiredPermissionType="view_modules">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Modules />} />
          </Route>

          <Route path="/reports" element={
            <PrivateRoute requiredPermissionType="view_reports">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Reports />} />
          </Route>
        </Route>

        {/* Cashier Routes */}
        <Route element={
          <CashierLayout>
            <Outlet />
          </CashierLayout>
        }>
          <Route path="/cashier/receipts" element={
            <PrivateRoute requiredPermissionType="view_cashier">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CashierReceipts />} />
          </Route>

          <Route path="/cashier/bank" element={
            <PrivateRoute requiredPermissionType="view_cashier">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CashierBank />} />
          </Route>

          <Route path="/cashier/reports" element={
            <PrivateRoute requiredPermissionType="view_cashier">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CashierReports />} />
          </Route>

          <Route path="/cashier/directories" element={
            <PrivateRoute requiredPermissionType="view_cashier">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CashierDirectories />} />
          </Route>

          <Route path="/cashier/directories/:directoryId" element={
            <PrivateRoute requiredPermissionType="view_cashier">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<DirectoryRecords />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
