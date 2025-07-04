/**
 * Utility functions for handling permission checks
 */

/**
 * Checks if a user has the required permission based on various criteria
 * @param {Array} userPermissions - Array of permission objects
 * @param {string} requiredType - Type of permission being checked (e.g., 'read', 'create', 'edit', 'delete')
 * @param {string|null} requiredModuleId - UUID of the module (optional)
 * @param {string|null} requiredDirectoryId - UUID of the directory (optional)
 * @param {Object|null} entityData - Data about the entity being accessed (optional)
 * @returns {boolean} - True if user has permission, false otherwise
 */
const checkPermission = (
  userPermissions,
  requiredType,
  requiredModuleId = null,
  requiredDirectoryId = null,
  entityData = null
) => {
  // Return false if no permissions are provided
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  const now = new Date();

  // Iterate through user permissions to find a match
  return userPermissions.some((p) => {
    // Check if permission type matches the required action or is 'manage' (which grants all actions)
    // Accept 'manage' as a superset for 'read', 'create', 'edit', 'delete'
    if (!(p.type === requiredType || p.type === 'manage')) {
      return false;
    }

    // Check module_id match (null module_id means global permission)
    if (p.module_id !== null && p.module_id !== requiredModuleId) {
      return false;
    }

    // Check directory_id match (null directory_id means global permission)
    if (p.directory_id !== null && p.directory_id !== requiredDirectoryId) {
      return false;
    }

    // Check effective date range
    if (p.effective_from && new Date(p.effective_from) > now) {
      return false;
    }
    if (p.effective_until && new Date(p.effective_until) < now) {
      return false;
    }

    // Handle constraint data for time-based permissions
    if (p.constraint_data) {
      // Check if this is a time-relative-to-creation constraint
      if (
        p.constraint_data.action === requiredType &&
        p.constraint_data.condition.type === 'time_relative_to_creation' &&
        entityData &&
        entityData.created_at
      ) {
        const createdDate = new Date(entityData.created_at);
        const daysDifference = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        const conditionValue = p.constraint_data.condition.value;

        switch (p.constraint_data.condition.operator) {
          case 'less_than':
            return daysDifference < conditionValue;
          case 'less_than_or_equal':
            return daysDifference <= conditionValue;
          case 'greater_than':
            return daysDifference > conditionValue;
          case 'greater_than_or_equal':
            return daysDifference >= conditionValue;
          case 'equal':
            return daysDifference === conditionValue;
          default:
            return false;
        }
      }
    }

    // If no constraints or all checks passed, permission is granted
    return true;
  });
};

module.exports = {
  checkPermission,
}; 