'use strict';

const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();

      // First, clean up existing roles and permissions
      console.log('Cleaning up existing roles and permissions...');
      await queryInterface.bulkDelete('user_role_assignments', null, {});
      await queryInterface.bulkDelete('role_permissions', null, {});
      await queryInterface.bulkDelete('user_roles', null, {});

      // Create demo companies if they don't exist
      const existingCompanies = await queryInterface.sequelize.query(
        'SELECT * FROM companies;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      let companies = existingCompanies;
      if (!companies || companies.length === 0) {
        console.log('Creating demo companies...');
        faker.locale = 'en';
        const industries = ['Technology', 'Textiles', 'Logistics', 'Finance', 'Retail', 'Manufacturing', 'Healthcare', 'Education'];
        const employeeCounts = ['less_than_10', '10_to_50', '50_to_100', '100_to_500', '500_to_1000'];
        const demoCompanies = Array.from({ length: 8 }, (_, i) => {
          return {
            id: uuidv4(),
            name: faker.company.name(),
            admin_email: faker.internet.email(),
            employee_count: faker.helpers.arrayElement(employeeCounts),
            status: 'active',
            logo: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
            address: faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + faker.location.country(),
            description: faker.company.catchPhrase(),
            website: faker.internet.url(),
            phone: faker.phone.number(),
            tax_id: faker.finance.accountNumber(12),
            registration_number: faker.string.uuid(),
            industry: faker.helpers.arrayElement(industries),
            founded_year: faker.date.past({ years: 30 }).getFullYear(),
            contacts: JSON.stringify({
              ceo: faker.person.fullName(),
              support: faker.internet.email(),
              phone: faker.phone.number()
            }),
            created_at: now,
            updated_at: now
          };
        });

        await queryInterface.bulkInsert('companies', demoCompanies);
        companies = await queryInterface.sequelize.query(
          'SELECT * FROM companies;',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
      }

      console.log('Creating system roles...');
      // Create system roles
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
        },
        {
          id: uuidv4(),
          name: 'user',
          description: 'Regular user with basic access',
          is_super_admin: false,
          created_at: now,
          updated_at: now
        }
      ];

      await queryInterface.bulkInsert('user_roles', roles);
      console.log('Roles created successfully');

      // Get the created roles
      const createdRoles = await queryInterface.sequelize.query(
        'SELECT * FROM user_roles;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!createdRoles || createdRoles.length === 0) {
        throw new Error('Failed to create roles');
      }

      const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
      const adminRole = createdRoles.find(r => r.name === 'admin');
      const managerRole = createdRoles.find(r => r.name === 'manager');
      const cashierRole = createdRoles.find(r => r.name === 'cashier');
      const salesmanRole = createdRoles.find(r => r.name === 'salesman');
      const userRole = createdRoles.find(r => r.name === 'user');

      if (!superAdminRole || !adminRole || !managerRole || !cashierRole || !salesmanRole || !userRole) {
        throw new Error('Some roles were not created successfully');
      }

      console.log('Creating role permissions...');
      // Define all modules and actions for super admin
      const allModules = [
        'system', 'companies', 'users', 'roles', 'reports', 'directories', 'modules', 'clients', 'cashier', 'sales', 'dashboard', 'profile', 'permissions', 'role_permissions'
      ];
      const allActions = ['view', 'create', 'update', 'delete', 'manage'];

      // Generate all permissions for super admin
      const permissions = [];
      for (const module of allModules) {
        for (const action of allActions) {
          permissions.push({
            id: uuidv4(),
            role_id: superAdminRole.id,
            module,
            action,
            created_at: now,
            updated_at: now
          });
        }
      }
      // Ensure super_admin has all CRUD permissions for 'company' entity
      const companyCrudActions = ['create', 'read', 'edit', 'delete'];
      for (const action of companyCrudActions) {
        permissions.push({
          id: uuidv4(),
          role_id: superAdminRole.id,
          module: 'company',
          action,
          created_at: now,
          updated_at: now
        });
      }

      // Admin permissions
      permissions.push({
        id: uuidv4(),
        role_id: adminRole.id,
        module: 'company',
        action: 'manage',
        created_at: now,
        updated_at: now
      });
      permissions.push({
        id: uuidv4(),
        role_id: adminRole.id,
        module: 'users',
        action: 'manage',
        created_at: now,
        updated_at: now
      });
      permissions.push({
        id: uuidv4(),
        role_id: adminRole.id,
        module: 'roles',
        action: 'manage',
        created_at: now,
        updated_at: now
      });
      permissions.push({
        id: uuidv4(),
        role_id: adminRole.id,
        module: 'reports',
        action: 'view',
        created_at: now,
        updated_at: now
      });
      // Manager permissions
      permissions.push({
        id: uuidv4(),
        role_id: managerRole.id,
        module: 'department',
        action: 'manage',
        created_at: now,
        updated_at: now
      });
      permissions.push({
        id: uuidv4(),
        role_id: managerRole.id,
        module: 'users',
        action: 'view',
        created_at: now,
        updated_at: now
      });
      permissions.push({
        id: uuidv4(),
        role_id: managerRole.id,
        module: 'reports',
        action: 'view',
        created_at: now,
        updated_at: now
      });
      // Cashier permissions
      permissions.push({
        id: uuidv4(),
        role_id: cashierRole.id,
        module: 'cashier',
        action: 'manage',
        created_at: now,
        updated_at: now
      });
      permissions.push({
        id: uuidv4(),
        role_id: cashierRole.id,
        module: 'sales',
        action: 'create',
        created_at: now,
        updated_at: now
      });
      // Salesman permissions
      permissions.push({
        id: uuidv4(),
        role_id: salesmanRole.id,
        module: 'sales',
        action: 'manage',
        created_at: now,
        updated_at: now
      });
      permissions.push({
        id: uuidv4(),
        role_id: salesmanRole.id,
        module: 'customers',
        action: 'manage',
        created_at: now,
        updated_at: now
      });
      // User permissions
      permissions.push({
        id: uuidv4(),
        role_id: userRole.id,
        module: 'dashboard',
        action: 'view',
        created_at: now,
        updated_at: now
      });
      permissions.push({
        id: uuidv4(),
        role_id: userRole.id,
        module: 'profile',
        action: 'manage',
        created_at: now,
        updated_at: now
      });

      // Get all existing permission names from the DB
      const existingPermissions = await queryInterface.sequelize.query(
        'SELECT name FROM permissions;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      const existingPermissionNames = new Set(existingPermissions.map(p => p.name));

      const permissionDefs = [];
      const permissionKeySet = new Set();
      permissions.forEach(p => {
        const key = `${p.module}:${p.action}`;
        const name = `${p.module}.${p.action}`;
        if (!permissionKeySet.has(key) && !existingPermissionNames.has(name)) {
          permissionKeySet.add(key);
          // Map action to type
          let type;
          switch (p.action) {
            case 'view':
              type = 'read';
              break;
            case 'create':
              type = 'create';
              break;
            case 'update':
              type = 'edit';
              break;
            case 'delete':
              type = 'delete';
              break;
            case 'manage':
              type = 'manage';
              break;
            default:
              type = 'read';
          }
          permissionDefs.push({
            id: uuidv4(),
            name,
            description: `${p.module} ${p.action}`,
            type,
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
      if (permissionDefs.length > 0) {
        await queryInterface.bulkInsert('permissions', permissionDefs);
      }

      // Step 2: Map module/action to permission_id
      const allPermissions = await queryInterface.sequelize.query(
        'SELECT * FROM permissions;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      function getPermissionId(module, action) {
        const perm = allPermissions.find(p => p.name === `${module}.${action}`);
        return perm ? perm.id : null;
      }

      // Step 3: Insert into role_permissions with permission_id
      const rolePermissions = permissions.map(p => ({
        id: p.id,
        role_id: p.role_id,
        permission_id: getPermissionId(p.module, p.action),
        created_at: p.created_at,
        updated_at: p.updated_at
      })).filter(rp => rp.permission_id);
      await queryInterface.bulkInsert('role_permissions', rolePermissions);
      console.log('Permissions created successfully');

      // Create demo users if they don't exist
      const existingUsers = await queryInterface.sequelize.query(
        'SELECT * FROM users;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!existingUsers || existingUsers.length === 0) {
        console.log('Creating demo users...');
        const bcrypt = require('bcrypt');
        
        // Generate 100 users
        const demoUsers = [];
        const roleTypes = ['admin', 'manager', 'user', 'Cashier', 'Salesman'];
        const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emma', 'William', 'Olivia'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        
        // Create super admin
        demoUsers.push({
          id: uuidv4(),
          email: 'superadmin@demo.com',
          password: await bcrypt.hash('password123', 10),
          firstname: 'Super',
          lastname: 'Admin',
          status: 'active',
          company_id: null,
          last_login: null,
          created_at: now,
          updated_at: now
        });

        // Create company admins
        for (let i = 0; i < companies.length; i++) {
          demoUsers.push({
            id: uuidv4(),
            email: `admin${i + 1}@demo.com`,
            password: await bcrypt.hash('password123', 10),
            firstname: 'Admin',
            lastname: `${i + 1}`,
            status: 'active',
            company_id: companies[i].id,
            last_login: null,
            created_at: now,
            updated_at: now
          });
        }

        // Create remaining users
        for (let i = 0; i < 97; i++) {
          const companyIndex = i % companies.length;
          const roleIndex = i % roleTypes.length;
          const firstNameIndex = i % firstNames.length;
          const lastNameIndex = i % lastNames.length;
          
          demoUsers.push({
            id: uuidv4(),
            email: `user${i + 1}@demo.com`,
            password: await bcrypt.hash('password123', 10),
            firstname: firstNames[firstNameIndex],
            lastname: lastNames[lastNameIndex],
            status: 'active',
            company_id: companies[companyIndex].id,
            last_login: null,
            created_at: now,
            updated_at: now
          });
        }

        await queryInterface.bulkInsert('users', demoUsers);
        console.log('Users created successfully');
      }

      // Get all users for role assignments
      const users = await queryInterface.sequelize.query(
        'SELECT * FROM users;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!users || users.length === 0) {
        throw new Error('No users found for role assignments');
      }

      // Create role assignments
      const roleAssignments = [];
      const roleNames = ['super_admin', 'admin', 'manager', 'user', 'Cashier', 'Salesman'];
      
      // Assign super admin role
      const superAdmin = users.find(u => u.email === 'superadmin@demo.com');
      if (superAdmin) {
        roleAssignments.push({
          id: uuidv4(),
          user_id: superAdmin.id,
          role_id: superAdminRole.id,
          company_id: companies[0].id,
          created_at: now,
          updated_at: now
        });
      }

      // Assign roles to remaining users
      users.forEach((user, index) => {
        if (user.email !== 'superadmin@demo.com') {
          let roleId;
          if (user.email.startsWith('admin')) {
            roleId = adminRole.id;
          } else {
            // Distribute roles evenly among remaining users
            const roleIndex = (index - 1) % 5; // -1 to account for super admin
            switch (roleIndex) {
              case 0:
                roleId = managerRole.id;
                break;
              case 1:
                roleId = userRole.id;
                break;
              case 2:
                roleId = cashierRole.id;
                break;
              case 3:
                roleId = salesmanRole.id;
                break;
              default:
                roleId = userRole.id;
            }
          }

          roleAssignments.push({
            id: uuidv4(),
            user_id: user.id,
            role_id: roleId,
            company_id: user.company_id,
            created_at: now,
            updated_at: now
          });
        }
      });

      await queryInterface.bulkInsert('user_role_assignments', roleAssignments);
      console.log('Role assignments created successfully');
      console.log('User roles seeder completed successfully!');
    } catch (error) {
      console.error('Error in user roles seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('user_role_assignments', null, {});
      await queryInterface.bulkDelete('role_permissions', null, {});
      await queryInterface.bulkDelete('user_roles', null, {});
      console.log('User roles seeder down completed successfully!');
    } catch (error) {
      console.error('Error in user roles seeder down:', error);
      throw error;
    }
  }
}; 