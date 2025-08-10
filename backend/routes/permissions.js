const express = require("express");
const router = express.Router();
const { authenticateUser, checkRole } = require("../middleware/auth");
const { authorize } = require("../middleware/permissionMiddleware");
const permissionsController = require("../controllers/permissions.controller");

// List all permissions
router.get(
  "/",
  authenticateUser,
  authorize('read', null, null, null, 'permissions.view'),
  checkRole(["super_admin"]),
  permissionsController.getAllPermissions
);

// Create new permission
router.post(
  "/",
  authenticateUser,
  authorize('create', null, null, null, 'permissions.create'),
  checkRole(["super_admin"]),
  permissionsController.createPermission
);

// Update permission
router.put(
  "/:id",
  authenticateUser,
  authorize('edit', null, null, null, 'permissions.update'),
  checkRole(["super_admin"]),
  permissionsController.updatePermission
);

// Delete permission
router.delete(
  "/:id",
  authenticateUser,
  authorize('delete', null, null, null, 'permissions.delete'),
  checkRole(["super_admin"]),
  permissionsController.deletePermission
);

// Assign permission to role
router.post(
  "/roles/:roleId/permissions",
  authenticateUser,
  authorize('create', null, null, null, 'role_permissions.create'),
  checkRole(["super_admin"]),
  permissionsController.assignPermissionToRole
);

// Get all permissions assigned to a role
router.get(
  "/roles/:roleId/permissions",
  authenticateUser,
  authorize('read', null, null, null, 'role_permissions.view'),
  checkRole(["super_admin"]),
  permissionsController.getRolePermissions
);

// Revoke permission from role
router.delete(
  "/roles/:roleId/permissions/:permissionId",
  authenticateUser,
  authorize('delete', null, null, null, 'role_permissions.delete'),
  checkRole(["super_admin"]),
  permissionsController.revokePermissionFromRole
);

module.exports = router; 