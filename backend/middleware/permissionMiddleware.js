const { checkPermission } = require('../utils/permissionUtils');

/**
 * Higher-order function that creates a middleware to check user permissions
 * @param {string} requiredType - The permission type required (e.g., 'read', 'edit')
 * @param {Function|string|null} getModuleId - Function to get module_id from req, or static module_id, or null
 * @param {Function|string|null} getDirectoryId - Function to get directory_id from req, or static directory_id, or null
 * @param {Function|null} getEntityData - Function to get entity data from req, or null
 * @returns {Function} Express middleware function
 */
const authorize = (requiredType, getModuleId = null, getDirectoryId = null, getEntityData = null) => {
  return async (req, res, next) => {
    try {
      // Ensure user and permissions exist
      if (!req.user || !req.user.permissions) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get module_id
      let moduleId = null;
      if (typeof getModuleId === 'function') {
        moduleId = await getModuleId(req);
      } else {
        moduleId = getModuleId;
      }

      // Get directory_id
      let directoryId = null;
      if (typeof getDirectoryId === 'function') {
        directoryId = await getDirectoryId(req);
      } else {
        directoryId = getDirectoryId;
      }

      // Get entity data
      let entityData = null;
      if (typeof getEntityData === 'function') {
        entityData = await getEntityData(req);
      }

      // Check if user has required permission
      const hasPermission = checkPermission(
        req.user.permissions,
        requiredType,
        moduleId,
        directoryId,
        entityData
      );

      if (!hasPermission) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Error in permission middleware:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = {
  authorize
}; 