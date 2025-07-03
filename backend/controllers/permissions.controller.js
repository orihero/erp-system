const models = require("../models");
const { Permission, UserRole, RolePermission, Module, Directory } = models;

module.exports = {
  async getAllPermissions(req, res) {
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
      res.status(500).json({ error: "Failed to fetch permissions: " + error.message });
    }
  },

  async createPermission(req, res) {
    try {
      const { name, description, type, module_id, directory_id } = req.body;
      const safeModuleId = module_id === '' ? null : module_id;
      const safeDirectoryId = directory_id === '' ? null : directory_id;
      const permission = await Permission.create({
        name,
        description,
        type,
        module_id: safeModuleId,
        directory_id: safeDirectoryId
      });
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error creating permission:", error);
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create permission: " + error.message });
    }
  },

  async updatePermission(req, res) {
    try {
      const { id } = req.params;
      const { name, description, type, module_id, directory_id, effective_from, effective_until, constraint_data } = req.body;
      const safeModuleId = module_id === '' ? null : module_id;
      const safeDirectoryId = directory_id === '' ? null : directory_id;
      const safeEffectiveFrom = effective_from === '' ? null : effective_from;
      const safeEffectiveUntil = effective_until === '' ? null : effective_until;
      const safeConstraintData = constraint_data === '' ? null : constraint_data;
      const permission = await Permission.findByPk(id);
      if (!permission) {
        return res.status(404).json({ error: "Permission not found." });
      }
      await permission.update({
        name,
        description,
        type,
        module_id: safeModuleId,
        directory_id: safeDirectoryId,
        effective_from: safeEffectiveFrom,
        effective_until: safeEffectiveUntil,
        constraint_data: safeConstraintData
      });
      res.json(permission);
    } catch (error) {
      console.error("Error updating permission:", error);
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to update permission: " + error.message });
    }
  },

  async deletePermission(req, res) {
    try {
      const { id } = req.params;
      const permission = await Permission.findByPk(id);
      if (!permission) {
        return res.status(404).json({ error: "Permission not found." });
      }
      const rolePermissions = await RolePermission.findAll({ where: { permission_id: id } });
      if (rolePermissions.length > 0) {
        return res.status(400).json({ error: "Cannot delete permission that is assigned to roles. Remove role assignments first." });
      }
      await permission.destroy();
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting permission:", error);
      res.status(500).json({ error: "Failed to delete permission: " + error.message });
    }
  },

  async assignPermissionToRole(req, res) {
    try {
      const { roleId } = req.params;
      const { permission_id, effective_from, effective_until, constraint_data } = req.body;
      const role = await UserRole.findByPk(roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found." });
      }
      const permission = await Permission.findByPk(permission_id);
      if (!permission) {
        return res.status(404).json({ error: "Permission not found." });
      }
      const existingAssignment = await RolePermission.findOne({
        where: { role_id: roleId, permission_id }
      });
      if (existingAssignment) {
        return res.status(400).json({ error: "Permission already assigned to role." });
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
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to assign permission to role: " + error.message });
    }
  },

  async revokePermissionFromRole(req, res) {
    try {
      const { roleId, permissionId } = req.params;
      const rolePermission = await RolePermission.findOne({
        where: { role_id: roleId, permission_id: permissionId }
      });
      if (!rolePermission) {
        return res.status(404).json({ error: "Role permission assignment not found." });
      }
      await rolePermission.destroy();
      res.status(204).send();
    } catch (error) {
      console.error("Error revoking permission from role:", error);
      res.status(500).json({ error: "Failed to revoke permission from role: " + error.message });
    }
  }
}; 