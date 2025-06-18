const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Set faker locale to Uzbek
faker.locale = 'uz';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();

      // Remove existing users and role assignments
      console.log('Cleaning up existing users and role assignments...');
      await queryInterface.bulkDelete('user_role_assignments', null, {});
      await queryInterface.bulkDelete('users', null, {});

      // Create demo companies
      const companies = [
        {
          id: uuidv4(),
          name: 'Demo Company 1',
          admin_email: 'admin1@demo.com',
          employee_count: '50_to_100',
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Demo Company 2',
          admin_email: 'admin2@demo.com',
          employee_count: '50_to_100',
          created_at: now,
          updated_at: now
        }
      ];

      console.log('Creating demo companies...');
      await queryInterface.bulkInsert('companies', companies);

      // Get the created companies
      const createdCompanies = await queryInterface.sequelize.query(
        'SELECT * FROM companies;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!createdCompanies || createdCompanies.length === 0) {
        console.log('No companies were created. Aborting seeder.');
        return;
      }

      console.log('Creating demo users...');
      
      // Create super admin
      const superAdmin = {
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
      };

      // Create company admins
      const companyAdmins = [
        {
          id: uuidv4(),
          email: 'admin1@demo.com',
          password: await bcrypt.hash('password123', 10),
          firstname: 'Admin',
          lastname: 'One',
          status: 'active',
          company_id: createdCompanies[0].id,
          last_login: null,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          email: 'admin2@demo.com',
          password: await bcrypt.hash('password123', 10),
          firstname: 'Admin',
          lastname: 'Two',
          status: 'active',
          company_id: createdCompanies[1].id,
          last_login: null,
          created_at: now,
          updated_at: now
        }
      ];

      // Create cashiers
      const cashiers = [
        {
          id: uuidv4(),
          email: 'cashier1@demo.com',
          password: await bcrypt.hash('password123', 10),
          firstname: 'John',
          lastname: 'Smith',
          status: 'active',
          company_id: createdCompanies[0].id,
          last_login: null,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          email: 'cashier2@demo.com',
          password: await bcrypt.hash('password123', 10),
          firstname: 'Sarah',
          lastname: 'Johnson',
          status: 'active',
          company_id: createdCompanies[1].id,
          last_login: null,
          created_at: now,
          updated_at: now
        }
      ];

      // Create salesmen
      const salesmen = [
        {
          id: uuidv4(),
          email: 'salesman1@demo.com',
          password: await bcrypt.hash('password123', 10),
          firstname: 'Mike',
          lastname: 'Brown',
          status: 'active',
          company_id: createdCompanies[0].id,
          last_login: null,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          email: 'salesman2@demo.com',
          password: await bcrypt.hash('password123', 10),
          firstname: 'Lisa',
          lastname: 'Davis',
          status: 'active',
          company_id: createdCompanies[1].id,
          last_login: null,
          created_at: now,
          updated_at: now
        }
      ];

      // Create 100 Uzbek users
      const uzbekUsers = Array.from({ length: 100 }, () => {
        const companyIndex = Math.floor(Math.random() * createdCompanies.length);
        return {
          id: uuidv4(),
          email: faker.internet.email(),
          password: bcrypt.hashSync('password123', 10),
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
          status: 'active',
          company_id: createdCompanies[companyIndex].id,
          last_login: null,
          created_at: now,
          updated_at: now
        };
      });

      // Combine all users
      const users = [superAdmin, ...companyAdmins, ...cashiers, ...salesmen, ...uzbekUsers];
      await queryInterface.bulkInsert('users', users);

      // Get the created users
      const createdUsers = await queryInterface.sequelize.query(
        'SELECT * FROM users;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!createdUsers || createdUsers.length === 0) {
        console.log('No users were created. Aborting seeder.');
        return;
      }

      console.log('Getting roles...');
      // Get the roles
      const roles = await queryInterface.sequelize.query(
        'SELECT * FROM user_roles;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!roles || roles.length === 0) {
        console.log('No roles found. Please run the user roles seeder first.');
        return;
      }

      const superAdminRole = roles.find(r => r.name === 'super_admin');
      const adminRole = roles.find(r => r.name === 'admin');
      const managerRole = roles.find(r => r.name === 'manager');
      const cashierRole = roles.find(r => r.name === 'cashier');
      const salesmanRole = roles.find(r => r.name === 'salesman');
      const userRole = roles.find(r => r.name === 'user');

      if (!superAdminRole || !adminRole || !managerRole || !cashierRole || !salesmanRole || !userRole) {
        console.log('Required roles not found. Please run the user roles seeder first.');
        return;
      }

      // Check if role assignments already exist
      const existingAssignments = await queryInterface.sequelize.query(
        'SELECT * FROM user_role_assignments WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%@demo.com\');',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (existingAssignments.length > 0) {
        console.log('Role assignments already exist. Skipping role assignment.');
        return;
      }

      console.log('Assigning roles to users...');
      
      // Assign roles to users
      const roleAssignments = [];

      // Assign super admin role
      roleAssignments.push({
        id: uuidv4(),
        user_id: createdUsers.find(u => u.email === 'superadmin@demo.com').id,
        role_id: superAdminRole.id,
        company_id: null,
        created_at: now,
        updated_at: now
      });

      // Assign admin roles
      roleAssignments.push({
        id: uuidv4(),
        user_id: createdUsers.find(u => u.email === 'admin1@demo.com').id,
        role_id: adminRole.id,
        company_id: createdCompanies[0].id,
        created_at: now,
        updated_at: now
      });

      roleAssignments.push({
        id: uuidv4(),
        user_id: createdUsers.find(u => u.email === 'admin2@demo.com').id,
        role_id: adminRole.id,
        company_id: createdCompanies[1].id,
        created_at: now,
        updated_at: now
      });

      // Assign cashier roles
      roleAssignments.push({
        id: uuidv4(),
        user_id: createdUsers.find(u => u.email === 'cashier1@demo.com').id,
        role_id: cashierRole.id,
        company_id: createdCompanies[0].id,
        created_at: now,
        updated_at: now
      });

      roleAssignments.push({
        id: uuidv4(),
        user_id: createdUsers.find(u => u.email === 'cashier2@demo.com').id,
        role_id: cashierRole.id,
        company_id: createdCompanies[1].id,
        created_at: now,
        updated_at: now
      });

      // Assign salesman roles
      roleAssignments.push({
        id: uuidv4(),
        user_id: createdUsers.find(u => u.email === 'salesman1@demo.com').id,
        role_id: salesmanRole.id,
        company_id: createdCompanies[0].id,
        created_at: now,
        updated_at: now
      });

      roleAssignments.push({
        id: uuidv4(),
        user_id: createdUsers.find(u => u.email === 'salesman2@demo.com').id,
        role_id: salesmanRole.id,
        company_id: createdCompanies[1].id,
        created_at: now,
        updated_at: now
      });

      // Assign manager roles to some Uzbek users
      const managerUsers = uzbekUsers.slice(0, 4); // Assign manager role to first 4 Uzbek users
      managerUsers.forEach(user => {
        roleAssignments.push({
          id: uuidv4(),
          user_id: user.id,
          role_id: managerRole.id,
          company_id: user.company_id,
          created_at: now,
          updated_at: now
        });
      });

      // Assign regular user roles to remaining Uzbek users
      const regularUsers = uzbekUsers.slice(4); // Remaining Uzbek users get regular user role
      regularUsers.forEach(user => {
        roleAssignments.push({
          id: uuidv4(),
          user_id: user.id,
          role_id: userRole.id,
          company_id: user.company_id,
          created_at: now,
          updated_at: now
        });
      });

      await queryInterface.bulkInsert('user_role_assignments', roleAssignments);
      console.log('Role assignments created successfully');
    } catch (error) {
      console.error('Error in demo users seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('user_role_assignments', null, {});
      await queryInterface.bulkDelete('users', null, {});
      await queryInterface.bulkDelete('companies', null, {});
      console.log('Demo users seeder down completed successfully!');
    } catch (error) {
      console.error('Error in demo users seeder down:', error);
      throw error;
    }
  }
}; 