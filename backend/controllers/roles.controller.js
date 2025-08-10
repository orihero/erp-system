const { UserRole, UserRoleAssignment } = require('../models');

module.exports = {
  async getAllRoles(req, res) {
    try {
      const roles = await UserRole.findAll({ attributes: ['id', 'name', 'description'] });
      res.json(roles);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch roles: ' + err.message });
    }
  },

  async createRole(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Role name is required.' });
      }
      const existing = await UserRole.findOne({ where: { name } });
      if (existing) {
        return res.status(409).json({ error: 'Role with this name already exists.' });
      }
      const role = await UserRole.create({ name, description, is_super_admin: false });
      res.status(201).json(role);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create role: ' + err.message });
    }
  },

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const role = await UserRole.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found.' });
      }
      if (role.is_system) {
        return res.status(403).json({ error: 'Cannot update system role.' });
      }
      if (name) role.name = name;
      if (description !== undefined) role.description = description;
      await role.save();
      res.json(role);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update role: ' + err.message });
    }
  },

  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const role = await UserRole.findByPk(id);
      if (!role) {
        return res.status(404).json({ error: 'Role not found.' });
      }
      if (role.is_system) {
        return res.status(403).json({ error: 'Cannot delete system role.' });
      }
      const assignments = await UserRoleAssignment.findOne({ where: { role_id: id } });
      if (assignments) {
        return res.status(400).json({ error: 'Cannot delete role assigned to users.' });
      }
      await role.destroy();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete role: ' + err.message });
    }
  }
}; 