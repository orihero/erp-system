'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();

      // Check if roles already exist
      const existingRoles = await queryInterface.sequelize.query(
        'SELECT * FROM user_roles;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (existingRoles.length > 0) {
        console.log('Roles already exist. Skipping role creation.');
        return;
      }

      console.log('Creating system roles...');
      // Create system roles
      const roles = [
        {
          id: uuidv4(),
          name: 'super_admin',
          description: 'Super Administrator with full system access',
          is_system: true,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'admin',
          description: 'Company Administrator with full company access',
          is_system: true,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'manager',
          description: 'Department Manager with limited administrative access',
          is_system: true,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'user',
          description: 'Regular user with basic access',
          is_system: true,
          created_at: now,
          updated_at: now
        }
      ];

      await queryInterface.bulkInsert('user_roles', roles);

      // Get the created roles
      const createdRoles = await queryInterface.sequelize.query(
        'SELECT * FROM user_roles;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!createdRoles || createdRoles.length === 0) {
        console.log('No roles were created. Aborting seeder.');
        return;
      }

      const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
      const adminRole = createdRoles.find(r => r.name === 'admin');
      const managerRole = createdRoles.find(r => r.name === 'manager');
      const userRole = createdRoles.find(r => r.name === 'user');

      if (!superAdminRole || !adminRole || !managerRole || !userRole) {
        console.log('Some roles were not created successfully. Aborting seeder.');
        return;
      }

      // Check if permissions already exist
      const existingPermissions = await queryInterface.sequelize.query(
        'SELECT * FROM role_permissions;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (existingPermissions.length > 0) {
        console.log('Permissions already exist. Skipping permission creation.');
        return;
      }

      console.log('Creating role permissions...');
      // Define permissions for each role
      const permissions = [
        // Super Admin permissions
        {
          id: uuidv4(),
          role_id: superAdminRole.id,
          module: 'system',
          action: 'manage',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          role_id: superAdminRole.id,
          module: 'companies',
          action: 'manage',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          role_id: superAdminRole.id,
          module: 'users',
          action: 'manage',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          role_id: superAdminRole.id,
          module: 'roles',
          action: 'manage',
          created_at: now,
          updated_at: now
        },

        // Admin permissions
        {
          id: uuidv4(),
          role_id: adminRole.id,
          module: 'company',
          action: 'manage',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          role_id: adminRole.id,
          module: 'users',
          action: 'manage',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          role_id: adminRole.id,
          module: 'directories',
          action: 'manage',
          created_at: now,
          updated_at: now
        },

        // Manager permissions
        {
          id: uuidv4(),
          role_id: managerRole.id,
          module: 'department',
          action: 'manage',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          role_id: managerRole.id,
          module: 'users',
          action: 'view',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          role_id: managerRole.id,
          module: 'directories',
          action: 'view',
          created_at: now,
          updated_at: now
        },

        // User permissions
        {
          id: uuidv4(),
          role_id: userRole.id,
          module: 'profile',
          action: 'manage',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          role_id: userRole.id,
          module: 'directories',
          action: 'view',
          created_at: now,
          updated_at: now
        }
      ];

      await queryInterface.bulkInsert('role_permissions', permissions);
      console.log('User roles seeder completed successfully!');
    } catch (error) {
      console.error('Error in user roles seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('role_permissions', null, {});
      await queryInterface.bulkDelete('user_roles', null, {});
      console.log('User roles seeder down completed successfully!');
    } catch (error) {
      console.error('Error in user roles seeder down:', error);
      throw error;
    }
  }
}; 