import React from 'react';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Signup from './pages/signup/Signup';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { store } from './store';
import { useAppSelector } from './store/hooks';
import { Snackbar } from './components/Snackbar';
import { CircularProgress, Box, ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './pages/dashboard/index';
import Clients from './pages/clients/index';
import Directories from './pages/directories';
import Companies from './pages/companies/index';
import CompanyDetail from './pages/companies/CompanyDetail';
import Modules from './pages/modules/Modules';
import CashierDashboard from './pages/cashier/Dashboard';
import Receipts from './pages/cashier/Receipts';
import DailySales from './pages/cashier/DailySales';
import Products from './pages/cashier/Products';
import Customers from './pages/cashier/Customers';

// admin@example.com / password123

const theme = createTheme({
  typography: {
    fontFamily: `'Outfit', 'Roboto', Arial, sans-serif`,
  },

});

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/signup" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/clients" element={
        <PrivateRoute>
          <Clients />
        </PrivateRoute>
      } />
      <Route path="/directories" element={
        <PrivateRoute>
          <Directories />
        </PrivateRoute>
      } />
      <Route path="/companies" element={
        <PrivateRoute>
          <Companies />
        </PrivateRoute>
      } />
      <Route path="/companies/:companyId" element={
        <PrivateRoute>
          <CompanyDetail />
        </PrivateRoute>
      } />
      <Route path="/modules" element={
        <PrivateRoute>
          <Modules />
        </PrivateRoute>
      } />
      <Route path="/cashier" element={
        <PrivateRoute>
          <Route index element={<Navigate to="/cashier/dashboard" replace />} />
          <Route path="dashboard" element={<CashierDashboard />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="daily-sales" element={<DailySales />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
        </PrivateRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <AppRoutes />
          <Snackbar />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
