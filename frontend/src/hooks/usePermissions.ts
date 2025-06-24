import { useSelector } from 'react-redux';
import { RootState } from '../store';

/**
 * Interface for the options passed to the check function
 */
export interface CheckPermissionOptions {
  requiredType: 'create' | 'read' | 'edit' | 'delete';
  entityType?: 'company' | 'company_directory' | 'directory' | 'directory_record' | 'report_structure' | 'user';
}

/**
 * Custom hook for checking user permissions
 * @returns An object containing a check function for permission evaluation
 */
export const usePermissions = () => {
  const userPermissions = useSelector((state: RootState) => state.auth.permissions) as string[];

  const check = ({ requiredType, entityType }: CheckPermissionOptions): boolean => {
    // Return false if no permissions are provided
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    // Map permission types to action names (matching backend logic)
    const typeToAction = {
      'create': 'create',
      'read': 'view',
      'edit': 'update',
      'delete': 'delete'
    };

    const requiredAction = typeToAction[requiredType];

    // Handle special entity type mappings (matching backend logic)
    let permissionPrefix = '';
    if (entityType === 'company') {
      permissionPrefix = 'companies';
    } else if (entityType === 'company_directory') {
      permissionPrefix = 'directories';
    } else if (entityType === 'user') {
      permissionPrefix = 'users';
    } else if (entityType === 'directory') {
      permissionPrefix = 'directories';
    } else if (entityType === 'directory_record') {
      permissionPrefix = 'directories';
    } else if (entityType === 'report_structure') {
      permissionPrefix = 'reports';
    }

    // Check if user has the required permission
    return userPermissions.some((permissionName) => {
      // Permission names are in format: 'module.action' (e.g., 'companies.view')
      const [module, action] = permissionName.split('.');
      
      // If we have a specific entity type, check for that prefix
      if (permissionPrefix) {
        if (module !== permissionPrefix || action !== requiredAction) {
          return false;
        }
      } else {
        // Otherwise just check the action (for general permissions like dashboard.view, modules.view, etc.)
        if (action !== requiredAction) {
          return false;
        }
      }

      // If no constraints or all checks passed, permission is granted
      return true;
    });
  };

  return { check };
}; 