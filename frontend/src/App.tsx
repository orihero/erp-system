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
import Roles from './pages/roles';
import PermissionsManagement from './pages/permissions/PermissionsManagement';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Layout from './components/Layout/Layout';
import CashierLayout from './components/Layout/CashierLayout';
import CompanyDetail from './pages/companies/CompanyDetail';
import UnauthorizedPage from './pages/UnauthorizedPage';

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
            <PrivateRoute requiredPermissionType="dashboard.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
          </Route>

          <Route path="/users" element={
            <PrivateRoute requiredPermissionType="users.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Modules />} />
          </Route>

          <Route path="/inventory" element={
            <PrivateRoute requiredPermissionType="modules.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Modules />} />
          </Route>

          <Route path="/clients" element={
            <PrivateRoute requiredPermissionType="clients.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Clients />} />
          </Route>

          <Route path="/directories" element={
            <PrivateRoute requiredPermissionType="directories.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Directories />} />
          </Route>

          <Route path="/directories/:directoryId" element={
            <PrivateRoute requiredPermissionType="directories.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<DirectoryRecords />} />
          </Route>

          <Route path="/companies" element={
            <PrivateRoute requiredPermissionType="companies.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Companies />} />
          </Route>

          <Route path="/companies/:companyId" element={
            <PrivateRoute requiredPermissionType="companies.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CompanyDetail />} />
          </Route>

          <Route path="/modules" element={
            <PrivateRoute requiredPermissionType="modules.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Modules />} />
          </Route>

          <Route path="/reports" element={
            <PrivateRoute requiredPermissionType="reports.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Reports />} />
          </Route>

          {/* Roles and Permissions Routes */}
          <Route path="/roles" element={
            <PrivateRoute requiredPermissionType="roles.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Roles />} />
          </Route>

          <Route path="/permissions" element={
            <PrivateRoute requiredPermissionType="permissions.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<PermissionsManagement />} />
          </Route>
        </Route>

        {/* Cashier Routes */}
        <Route element={
          <CashierLayout>
            <Outlet />
          </CashierLayout>
        }>
          <Route path="/cashier/receipts" element={
            <PrivateRoute requiredPermissionType="cashier.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CashierReceipts />} />
          </Route>

          <Route path="/cashier/bank" element={
            <PrivateRoute requiredPermissionType="cashier.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CashierBank />} />
          </Route>

          <Route path="/cashier/reports" element={
            <PrivateRoute requiredPermissionType="cashier.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CashierReports />} />
          </Route>

          <Route path="/cashier/directories" element={
            <PrivateRoute requiredPermissionType="cashier.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<CashierDirectories />} />
          </Route>

          <Route path="/cashier/directories/:directoryId" element={
            <PrivateRoute requiredPermissionType="cashier.view">
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
