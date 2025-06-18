import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { usePermissions } from '../../hooks/usePermissions';

interface PrivateRouteProps {
  requiredPermissionType: string;
  moduleId?: string;
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  requiredPermissionType,
  moduleId,
  children,
}) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { check } = usePermissions();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasPermission = check({ 
    requiredType: requiredPermissionType,
    moduleId: moduleId 
  });

  if (!hasPermission) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;