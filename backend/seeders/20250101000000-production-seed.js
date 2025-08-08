'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();
      console.log('Starting production seed...');

      // Clean up existing data
      console.log('Cleaning up existing data...');
      await queryInterface.bulkDelete('user_role_assignments', null, {});
      await queryInterface.bulkDelete('role_permissions', null, {});
      await queryInterface.bulkDelete('permissions', null, {});
      await queryInterface.bulkDelete('user_roles', null, {});
      await queryInterface.bulkDelete('users', null, {});
      await queryInterface.bulkDelete('modules', null, {});

      // Create essential modules
      console.log('Creating essential modules...');
      const modules = [
        {
          id: uuidv4(),
          name: 'Dashboard',
          icon_name: 'material-symbols:dashboard',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Cashier',
          icon_name: 'material-symbols:point-of-sale',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Inventory',
          icon_name: 'material-symbols:inventory',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Realization',
          icon_name: 'material-symbols:trending-up',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Accounting',
          icon_name: 'material-symbols:account-balance',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Purchases',
          icon_name: 'material-symbols:shopping-cart',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Sales',
          icon_name: 'material-symbols:store',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Reports',
          icon_name: 'material-symbols:assessment',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Settings',
          icon_name: 'material-symbols:settings',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Companies',
          icon_name: 'material-symbols:business',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Users',
          icon_name: 'material-symbols:people',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Roles',
          icon_name: 'material-symbols:admin-panel-settings',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Permissions',
          icon_name: 'material-symbols:security',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Directories',
          icon_name: 'material-symbols:folder',
          created_at: now,
          updated_at: now
        }
      ];

      await queryInterface.bulkInsert('modules', modules, {});

      // Get module IDs for permission creation
      const createdModules = await queryInterface.sequelize.query(
        'SELECT id, name FROM modules;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      const moduleMap = {};
      createdModules.forEach(module => {
        moduleMap[module.name.toLowerCase()] = module.id;
      });

      // Create all user roles
      console.log('Creating user roles...');
      const roles = [
        {
          id: uuidv4(),
          name: 'super_admin',
          description: 'Super Administrator with full system access',
          is_super_admin: true,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'admin',
          description: 'Company Administrator with full company access',
          is_super_admin: false,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'manager',
          description: 'Department Manager with limited administrative access',
          is_super_admin: false,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'cashier',
          description: 'Cashier with access to sales and payment features',
          is_super_admin: false,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'salesman',
          description: 'Sales representative with access to sales and customer features',
          is_super_admin: false,
          created_at: now,
          updated_at: now
        }
      ];

      await queryInterface.bulkInsert('user_roles', roles, {});
      const superAdminRoleId = roles[0].id; // super_admin role ID

      // Create comprehensive permissions for all modules
      console.log('Creating comprehensive permissions...');
      const permissions = [];

      // Define all possible actions for each module
      const moduleActions = {
        'dashboard': ['view', 'manage'],
        'cashier': ['view', 'create', 'update', 'delete', 'manage'],
        'inventory': ['view', 'create', 'update', 'delete', 'manage'],
        'realization': ['view', 'create', 'update', 'delete', 'manage'],
        'accounting': ['view', 'create', 'update', 'delete', 'manage'],
        'purchases': ['view', 'create', 'update', 'delete', 'manage'],
        'sales': ['view', 'create', 'update', 'delete', 'manage'],
        'reports': ['view', 'create', 'update', 'delete', 'manage'],
        'settings': ['view', 'update', 'manage'],
        'companies': ['view', 'create', 'update', 'delete', 'manage'],
        'users': ['view', 'create', 'update', 'delete', 'manage'],
        'roles': ['view', 'create', 'update', 'delete', 'manage'],
        'permissions': ['view', 'create', 'update', 'delete', 'manage'],
        'directories': ['view', 'create', 'update', 'delete', 'manage']
      };

      // Create permissions for each module and action
      Object.entries(moduleActions).forEach(([moduleName, actions]) => {
        const moduleId = moduleMap[moduleName];
        if (moduleId) {
          actions.forEach(action => {
            permissions.push({
              id: uuidv4(),
              name: `${moduleName}.${action}`,
              description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${moduleName}`,
              type: action === 'manage' ? 'manage' : action === 'view' ? 'read' : 'write',
              module_id: moduleId,
              directory_id: null,
              effective_from: null,
              effective_until: null,
              constraint_data: null,
              created_at: now,
              updated_at: now
            });
          });
        }
      });

      // Add system-wide permissions
      const systemPermissions = [
        {
          id: uuidv4(),
          name: 'system.manage',
          description: 'Full system management access',
          type: 'manage',
          module_id: null,
          directory_id: null,
          effective_from: null,
          effective_until: null,
          constraint_data: null,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'system.view',
          description: 'View system-wide data',
          type: 'read',
          module_id: null,
          directory_id: null,
          effective_from: null,
          effective_until: null,
          constraint_data: null,
          created_at: now,
          updated_at: now
        }
      ];

      permissions.push(...systemPermissions);

      await queryInterface.bulkInsert('permissions', permissions, {});

      // Assign all permissions to super admin role
      console.log('Assigning all permissions to super admin role...');
      const allPermissions = await queryInterface.sequelize.query(
        'SELECT id FROM permissions;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      const rolePermissions = allPermissions.map(permission => ({
        id: uuidv4(),
        role_id: superAdminRoleId,
        permission_id: permission.id,
        created_at: now,
        updated_at: now
      }));

      await queryInterface.bulkInsert('role_permissions', rolePermissions, {});

      // Create super admin user
      console.log('Creating super admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const superAdminUser = {
        id: uuidv4(),
        email: 'admin@erp.com',
        password: hashedPassword,
        firstname: 'Super',
        lastname: 'Admin',
        status: 'active',
        company_id: null, // Super admin is not tied to any specific company
        last_login: null,
        created_at: now,
        updated_at: now
      };

      await queryInterface.bulkInsert('users', [superAdminUser], {});

      // Assign super admin role to the user
      const createdUser = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE email = ?;',
        { 
          replacements: ['admin@erp.com'],
          type: queryInterface.sequelize.QueryTypes.SELECT 
        }
      );

      if (createdUser && createdUser.length > 0) {
        const userRoleAssignment = {
          id: uuidv4(),
          user_id: createdUser[0].id,
          role_id: superAdminRoleId,
          created_at: now,
          updated_at: now
        };

        await queryInterface.bulkInsert('user_role_assignments', [userRoleAssignment], {});
      }

      console.log('Production seed completed successfully!');
      console.log('Super admin credentials:');
      console.log('Email: admin@erp.com');
      console.log('Password: admin123');

    } catch (error) {
      console.error('Error during production seed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Rolling back production seed...');
      
      // Remove in reverse order to respect foreign key constraints
      await queryInterface.bulkDelete('user_role_assignments', null, {});
      await queryInterface.bulkDelete('role_permissions', null, {});
      await queryInterface.bulkDelete('permissions', null, {});
      await queryInterface.bulkDelete('user_roles', null, {});
      await queryInterface.bulkDelete('users', null, {});
      await queryInterface.bulkDelete('modules', null, {});
      
      console.log('Production seed rollback completed!');
    } catch (error) {
      console.error('Error during production seed rollback:', error);
      throw error;
    }
  }
}; 