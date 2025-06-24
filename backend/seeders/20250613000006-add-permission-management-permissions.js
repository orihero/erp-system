'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();

      console.log('Adding permission management permissions for super admin...');

      // Get the super admin role
      const superAdminRole = await queryInterface.sequelize.query(
        'SELECT * FROM user_roles WHERE name = ?;',
        { 
          replacements: ['super_admin'],
          type: queryInterface.sequelize.QueryTypes.SELECT 
        }
      );

      if (!superAdminRole || superAdminRole.length === 0) {
        throw new Error('Super admin role not found');
      }

      const roleId = superAdminRole[0].id;

      // Define permission management permissions
      const permissionManagementPermissions = [
        {
          module: 'permissions',
          action: 'view',
          description: 'View system permissions'
        },
        {
          module: 'permissions',
          action: 'create',
          description: 'Create new permissions'
        },
        {
          module: 'permissions',
          action: 'update',
          description: 'Update existing permissions'
        },
        {
          module: 'permissions',
          action: 'delete',
          description: 'Delete permissions'
        },
        {
          module: 'permissions',
          action: 'manage',
          description: 'Full management of permissions'
        },
        {
          module: 'role_permissions',
          action: 'view',
          description: 'View role permission assignments'
        },
        {
          module: 'role_permissions',
          action: 'create',
          description: 'Assign permissions to roles'
        },
        {
          module: 'role_permissions',
          action: 'update',
          description: 'Update role permission assignments'
        },
        {
          module: 'role_permissions',
          action: 'delete',
          description: 'Remove permissions from roles'
        },
        {
          module: 'role_permissions',
          action: 'manage',
          description: 'Full management of role permissions'
        }
      ];

      // Get existing permissions to avoid duplicates
      const existingPermissions = await queryInterface.sequelize.query(
        'SELECT name FROM permissions;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      const existingPermissionNames = new Set(existingPermissions.map(p => p.name));

      // Create new permission definitions
      const newPermissionDefs = [];
      permissionManagementPermissions.forEach(perm => {
        const name = `${perm.module}.${perm.action}`;
        if (!existingPermissionNames.has(name)) {
          newPermissionDefs.push({
            id: uuidv4(),
            name,
            description: perm.description,
            type: 'module',
            module_id: null,
            directory_id: null,
            effective_from: null,
            effective_until: null,
            constraint_data: null,
            created_at: now,
            updated_at: now
          });
        }
      });

      // Insert new permission definitions
      if (newPermissionDefs.length > 0) {
        await queryInterface.bulkInsert('permissions', newPermissionDefs);
        console.log(`Created ${newPermissionDefs.length} new permission definitions`);
      }

      // Get all permissions (including newly created ones)
      const allPermissions = await queryInterface.sequelize.query(
        'SELECT * FROM permissions;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      function getPermissionId(module, action) {
        const perm = allPermissions.find(p => p.name === `${module}.${action}`);
        return perm ? perm.id : null;
      }

      // Get existing role permissions to avoid duplicates
      const existingRolePermissions = await queryInterface.sequelize.query(
        'SELECT role_id, permission_id FROM role_permissions WHERE role_id = ?;',
        { 
          replacements: [roleId],
          type: queryInterface.sequelize.QueryTypes.SELECT 
        }
      );
      const existingRolePermissionPairs = new Set(
        existingRolePermissions.map(rp => `${rp.role_id}:${rp.permission_id}`)
      );

      // Create role permission assignments
      const newRolePermissions = [];
      permissionManagementPermissions.forEach(perm => {
        const permissionId = getPermissionId(perm.module, perm.action);
        if (permissionId && !existingRolePermissionPairs.has(`${roleId}:${permissionId}`)) {
          newRolePermissions.push({
            id: uuidv4(),
            role_id: roleId,
            permission_id: permissionId,
            created_at: now,
            updated_at: now
          });
        }
      });

      // Insert new role permission assignments
      if (newRolePermissions.length > 0) {
        await queryInterface.bulkInsert('role_permissions', newRolePermissions);
        console.log(`Created ${newRolePermissions.length} new role permission assignments`);
      }

      console.log('Permission management permissions added successfully for super admin!');
    } catch (error) {
      console.error('Error adding permission management permissions:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing permission management permissions...');

      // Get the super admin role
      const superAdminRole = await queryInterface.sequelize.query(
        'SELECT * FROM user_roles WHERE name = ?;',
        { 
          replacements: ['super_admin'],
          type: queryInterface.sequelize.QueryTypes.SELECT 
        }
      );

      if (superAdminRole && superAdminRole.length > 0) {
        const roleId = superAdminRole[0].id;

        // Get permission IDs for permission management
        const permissionIds = await queryInterface.sequelize.query(
          `SELECT id FROM permissions WHERE name IN (
            'permissions.view', 'permissions.create', 'permissions.update', 'permissions.delete', 'permissions.manage',
            'role_permissions.view', 'role_permissions.create', 'role_permissions.update', 'role_permissions.delete', 'role_permissions.manage'
          );`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (permissionIds.length > 0) {
          const permIds = permissionIds.map(p => p.id);
          
          // Remove role permission assignments
          await queryInterface.sequelize.query(
            'DELETE FROM role_permissions WHERE role_id = ? AND permission_id IN (?);',
            { 
              replacements: [roleId, permIds]
            }
          );

          // Remove permission definitions
          await queryInterface.sequelize.query(
            'DELETE FROM permissions WHERE id IN (?);',
            { 
              replacements: [permIds]
            }
          );
        }
      }

      console.log('Permission management permissions removed successfully!');
    } catch (error) {
      console.error('Error removing permission management permissions:', error);
      throw error;
    }
  }
}; 