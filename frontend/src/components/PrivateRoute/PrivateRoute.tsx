import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import DashboardHeader from '../DashboardHeader';
import Sidebar from '../Sidebar';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const HEADER_HEIGHT = 80;
const SIDEBAR_WIDTH = 240;

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // If still loading, you might want to show a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Use replace to prevent adding to history stack
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f5' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: HEADER_HEIGHT, zIndex: 100 }}>
        <DashboardHeader />
      </div>
      <Sidebar />
      <main style={{ marginLeft: SIDEBAR_WIDTH, paddingTop: HEADER_HEIGHT, minHeight: '100vh', flex: 1, display: 'flex', flexDirection: 'row' }}>
        {children}
      </main>
    </div>
  );
};

export default PrivateRoute; 