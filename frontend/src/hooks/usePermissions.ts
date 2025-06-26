import { useSelector } from 'react-redux';
import { RootState } from '../store';
import type { Permission } from '../api/services/types';

/**
 * Interface for the options passed to the check function
 */
export interface CheckPermissionOptions {
  requiredType: 'create' | 'read' | 'edit' | 'delete' | 'manage';
  entityType?: 'company' | 'company_directory' | 'directory' | 'directory_record' | 'report_structure' | 'user';
}

/**
 * Custom hook for checking user permissions
 * @returns An object containing a check function for permission evaluation
 */
export const usePermissions = () => {
  const userPermissions = useSelector((state: RootState) => state.auth.permissions) as Permission[];

  const check = ({ requiredType, entityType }: CheckPermissionOptions): boolean => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    // Map entity types to permission name prefixes
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

    return userPermissions.some((perm) => {
      // Check prefix
      if (permissionPrefix) {
        const [module] = perm.name.split('.');
        if (module !== permissionPrefix) return false;
      }
      // Check type
      if (perm.type === requiredType || perm.type === 'manage') {
        return true;
      }
      return false;
    });
  };

  return { check };
}; 