import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { usePermissions } from '../../hooks/usePermissions';

interface PrivateRouteProps {
  requiredPermissionType: string;
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  requiredPermissionType,
  children,
}) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { check } = usePermissions();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Parse the permission name to extract entity type and action
  // Permission names are in format: 'module.action' (e.g., 'dashboard.view')
  const [entityType, action] = requiredPermissionType.split('.');
  
  // Map action to requiredType
  const actionToType: Record<string, 'create' | 'read' | 'edit' | 'delete' | 'manage'> = {
    'view': 'read',
    'create': 'create',
    'update': 'edit',
    'delete': 'delete',
    'manage': 'manage'
  };

  const requiredType = actionToType[action] || 'read';

  // Map entity types to the expected format
  const entityTypeMap: Record<string, 'company' | 'company_directory' | 'directory' | 'directory_record' | 'report_structure' | 'user'> = {
    'dashboard': 'user', // dashboard permissions are typically user-level
    'users': 'user',
    'modules': 'user', // modules permissions are typically user-level
    'clients': 'user', // clients permissions are typically user-level
    'directories': 'directory',
    'companies': 'company',
    'reports': 'report_structure',
    'cashier': 'user' // cashier permissions are typically user-level
  };

  const mappedEntityType = entityTypeMap[entityType] || 'user';

  console.log('mappedEntityType', mappedEntityType);
  console.log('requiredType', requiredType);

  const hasPermission = check({ 
    requiredType,
    entityType: mappedEntityType
  });

  console.log('hasPermission', hasPermission);  

  if (!hasPermission) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;