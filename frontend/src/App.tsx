import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/clients" element={
          <PrivateRoute>
            <Layout>
              <Clients />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/directories" element={
          <PrivateRoute>
            <Layout>
              <Directories />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/directories/:directoryId" element={
          <PrivateRoute>
            <Layout>
              <DirectoryRecords />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/companies" element={
          <PrivateRoute>
            <Layout>
              <Companies />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/companies/:companyId" element={
          <PrivateRoute>
            <Layout>
              <CompanyDetail />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/modules" element={
          <PrivateRoute>
            <Layout>
              <Modules />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/reports" element={
          <PrivateRoute>
            <Layout>
              <Reports />
            </Layout>
          </PrivateRoute>
        } />

        {/* Cashier Routes */}
        <Route path="/cashier/receipts" element={
          <PrivateRoute>
            <CashierLayout>
              <CashierReceipts />
            </CashierLayout>
          </PrivateRoute>
        } />

        <Route path="/cashier/bank" element={
          <PrivateRoute>
            <CashierLayout>
              <CashierBank />
            </CashierLayout>
          </PrivateRoute>
        } />

        <Route path="/cashier/reports" element={
          <PrivateRoute>
            <CashierLayout>
              <CashierReports />
            </CashierLayout>
          </PrivateRoute>
        } />

        <Route path="/cashier/directories" element={
          <PrivateRoute>
            <CashierLayout>
              <CashierDirectories />
            </CashierLayout>
          </PrivateRoute>
        } />

        <Route path="/cashier/directories/:directoryId" element={
          <PrivateRoute>
            <CashierLayout>
              <DirectoryRecords />
            </CashierLayout>
          </PrivateRoute>
        } />
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
