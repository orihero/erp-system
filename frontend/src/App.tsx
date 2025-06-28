import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
import CompanyDetail from './pages/companies/CompanyDetail';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UserRoles from './pages/roles';
import type { NavigationItem } from './api/services/types';
import Settings from './pages/Settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type SubItemWithModule = { directory_type: string; name: string; path?: string };

const theme = createTheme({
  typography: {
    fontFamily: `'Outfit', 'Roboto', Arial, sans-serif`,
  },
});

function AutoRedirector() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigation = useSelector((state: RootState) => state.navigation.navigation);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      isAuthenticated &&
      Array.isArray(navigation) &&
      navigation.length > 0 &&
      (location.pathname === '/' || location.pathname === '/dashboard')
    ) {
      function findFirstModuleDirectory(navItems: NavigationItem[]): string | null {
        for (const item of navItems) {
          const subItems = (item as unknown as { subItems?: unknown[] }).subItems;
          if (Array.isArray(subItems) && subItems.length > 0) {
            for (const sub of subItems) {
              if (
                typeof sub === 'object' &&
                sub !== null &&
                'directory_type' in sub &&
                (sub as SubItemWithModule).directory_type === 'module' &&
                'name' in sub &&
                typeof (sub as SubItemWithModule).name === 'string'
              ) {
                // Use sub.path if it exists, otherwise construct fallback
                return (sub as SubItemWithModule).path || `/directories/${(sub as SubItemWithModule).name.toLowerCase().replace(/ /g, '-')}`;
              }
            }
            const found = findFirstModuleDirectory(subItems as NavigationItem[]);
            if (found) return found;
          }
        }
        return null;
      }

      console.log('navigation', navigation);
      const firstModuleDirectoryPath = findFirstModuleDirectory(navigation);
      console.log('firstModuleDirectoryPath', firstModuleDirectoryPath);
      if (firstModuleDirectoryPath) {
        navigate(firstModuleDirectoryPath, { replace: true });
      }
    }
  }, [isAuthenticated, navigation, location, navigate]);
  return null;
}

const AppRoutes: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <div style={{ backgroundColor: '#eef2f5' }}>
      <AutoRedirector />
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

          {/* User Roles Route */}
          <Route path="/user-roles" element={
            <PrivateRoute requiredPermissionType="roles.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<UserRoles />} />
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

          {/* Settings Route */}
          <Route path="/settings" element={
            <PrivateRoute requiredPermissionType="settings.view">
              <Outlet />
            </PrivateRoute>
          }>
            <Route index element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Router>
            <AppRoutes />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
