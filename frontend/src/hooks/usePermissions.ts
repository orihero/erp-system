import { useSelector } from 'react-redux';
import { RootState } from '../store';

/**
 * Interface for the options passed to the check function
 */
export interface CheckPermissionOptions {
  requiredType: string;
  moduleId?: string;
}

/**
 * Custom hook for checking user permissions
 * @returns An object containing a check function for permission evaluation
 */
export const usePermissions = () => {
  const userPermissions = useSelector((state: RootState) => state.auth.permissions);

  const check = ({ requiredType, moduleId }: CheckPermissionOptions): boolean => {
    // Return false if no permissions are provided
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    // If moduleId is provided, check for module-specific permission
    if (moduleId) {
      const modulePermission = `${requiredType}_${moduleId}`;
      return userPermissions.includes(modulePermission);
    }

    // Check if the user has the required permission type
    return userPermissions.includes(requiredType);
  };

  return { check };
}; 