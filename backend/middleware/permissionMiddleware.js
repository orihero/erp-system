const { checkPermission } = require("../utils/permissionUtils");

/**
 * Higher-order function that creates a middleware to check user permissions
 * @param {string} requiredType - The permission type required (e.g., 'read', 'edit')
 * @param {Function|string|null} getModuleId - Function to get module_id from req, or static module_id, or null
 * @param {Function|string|null} getDirectoryId - Function to get directory_id from req, or static directory_id, or null
 * @param {Function|null} getEntityData - Function to get entity data from req, or null
 * @param {string|null} requiredPermissionName - (Optional) Permission name to check directly (e.g., 'directories.view')
 * @returns {Function} Express middleware function
 */
const authorize = (
  requiredType,
  getModuleId = null,
  getDirectoryId = null,
  getEntityData = null,
  requiredPermissionName = null
) => {
  return async (req, res, next) => {
    try {
      // Ensure user and permissions exist
      if (!req.user || !req.user.permissions) {
        console.log('User or permissions missing:', { 
          hasUser: !!req.user, 
          hasPermissions: !!(req.user && req.user.permissions),
          userPermissions: req.user?.permissions 
        });
        return res
          .status(401)
          .json({ message: "User not authenticated", method: "authorize" });
      }

      console.log("requiredPermissionName", requiredPermissionName);
      console.log("User permissions:", req.user.permissions.map(p => p.name));
      
      // If a permission name is provided, check for it directly
      if (requiredPermissionName) {
        const hasNamedPermission = req.user.permissions.some(
          (p) => p.name === requiredPermissionName
        );
        console.log("Checking named permission:", requiredPermissionName, "Result:", hasNamedPermission);
        if (!hasNamedPermission) {
          return res.status(403).json({
            message: "Forbidden: Insufficient permissions",
            method: "authorize",
            requiredPermissionName,
          });
        }
        return next();
      }

      // Get module_id
      let moduleId = null;
      if (typeof getModuleId === "function") {
        moduleId = await getModuleId(req);
      } else {
        moduleId = getModuleId;
      }

      // Get directory_id
      let directoryId = null;
      if (typeof getDirectoryId === "function") {
        directoryId = await getDirectoryId(req);
      } else {
        directoryId = getDirectoryId;
      }

      // Get entity data
      let entityData = null;
      if (typeof getEntityData === "function") {
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
        return res.status(403).json({
          message: "Forbidden: Insufficient permissions",
          method: "authorize",
          requiredPermissionName,
        });
      }

      next();
    } catch (error) {
      console.error("Error in permission middleware:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", method: "authorize" });
    }
  };
};

module.exports = {
  authorize,
};
