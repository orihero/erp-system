const express = require("express");
const router = express.Router();
const { authenticateToken, checkRole } = require("../middleware/auth");
const { authorize } = require("../middleware/permissionMiddleware");
const models = require("../models");
const { Permission, UserRole, RolePermission, Module, Directory } = models;

// List all permissions
router.get("/", 
  authenticateToken,
  authorize('read', () => 'uuid_of_permissions_module'),
  checkRole(["super_admin"]),
  async (req, res) => {
    try {
      const permissions = await Permission.findAll({
        include: [
          { model: Module, as: 'module' },
          { model: Directory, as: 'directory' }
        ]
      });
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create new permission
router.post("/",
  authenticateToken,
  authorize('create', () => 'uuid_of_permissions_module'),
  checkRole(["super_admin"]),
  async (req, res) => {
    try {
      const { name, description, type, module_id, directory_id } = req.body;
      
      const permission = await Permission.create({
        name,
        description,
        type,
        module_id,
        directory_id
      });

      res.status(201).json(permission);
    } catch (error) {
      console.error("Error creating permission:", error);
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update permission
router.put("/:id",
  authenticateToken,
  authorize('edit', () => 'uuid_of_permissions_module'),
  checkRole(["super_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, type, module_id, directory_id } = req.body;

      const permission = await Permission.findByPk(id);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      await permission.update({
        name,
        description,
        type,
        module_id,
        directory_id
      });

      res.json(permission);
    } catch (error) {
      console.error("Error updating permission:", error);
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete permission
router.delete("/:id",
  authenticateToken,
  authorize('delete', () => 'uuid_of_permissions_module'),
  checkRole(["super_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const permission = await Permission.findByPk(id);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      // Check if permission is assigned to any roles
      const rolePermissions = await RolePermission.findAll({
        where: { permission_id: id }
      });

      if (rolePermissions.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete permission that is assigned to roles. Remove role assignments first." 
        });
      }

      await permission.destroy();
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting permission:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Assign permission to role
router.post("/roles/:roleId/permissions",
  authenticateToken,
  authorize('create', () => 'uuid_of_permissions_module'),
  checkRole(["super_admin"]),
  async (req, res) => {
    try {
      const { roleId } = req.params;
      const { permission_id, effective_from, effective_until, constraint_data } = req.body;

      // Check if role exists
      const role = await UserRole.findByPk(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      // Check if permission exists
      const permission = await Permission.findByPk(permission_id);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      // Check if assignment already exists
      const existingAssignment = await RolePermission.findOne({
        where: { role_id: roleId, permission_id }
      });

      if (existingAssignment) {
        return res.status(400).json({ message: "Permission already assigned to role" });
      }

      const rolePermission = await RolePermission.create({
        role_id: roleId,
        permission_id,
        effective_from,
        effective_until,
        constraint_data
      });

      res.status(201).json(rolePermission);
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Revoke permission from role
router.delete("/roles/:roleId/permissions/:permissionId",
  authenticateToken,
  authorize('delete', () => 'uuid_of_permissions_module'),
  checkRole(["super_admin"]),
  async (req, res) => {
    try {
      const { roleId, permissionId } = req.params;

      const rolePermission = await RolePermission.findOne({
        where: { role_id: roleId, permission_id: permissionId }
      });

      if (!rolePermission) {
        return res.status(404).json({ message: "Role permission assignment not found" });
      }

      await rolePermission.destroy();
      res.status(204).send();
    } catch (error) {
      console.error("Error revoking permission from role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router; 