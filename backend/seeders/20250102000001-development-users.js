'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();
      console.log('Creating development users for Uzbek companies...');

      // Get companies
      const companies = await queryInterface.sequelize.query(
        'SELECT id, name FROM companies WHERE name LIKE \'%Uzbek%\' OR name LIKE \'%Tashkent%\' OR name LIKE \'%Samarkand%\' OR name LIKE \'%Bukhara%\' OR name LIKE \'%Andijan%\' OR name LIKE \'%Fergana%\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!companies || companies.length === 0) {
        throw new Error('No Uzbek companies found. Please run the companies seeder first.');
      }

      // Check if users already exist for these companies
      const existingUsers = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM users WHERE company_id IN (SELECT id FROM companies WHERE name LIKE \'%Uzbek%\' OR name LIKE \'%Tashkent%\' OR name LIKE \'%Samarkand%\' OR name LIKE \'%Bukhara%\' OR name LIKE \'%Andijan%\' OR name LIKE \'%Fergana%\');',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (existingUsers[0].count > 0) {
        console.log(`Found ${existingUsers[0].count} existing users for Uzbek companies. Skipping user creation.`);
        return;
      }

























      // Get roles (excluding super_admin)
      const roles = await queryInterface.sequelize.query(
        'SELECT id, name FROM user_roles WHERE name != \'super_admin\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!roles || roles.length === 0) {
        throw new Error('No user roles found. Please run the production seeder first.');
      }

      const users = [];
      const userRoleAssignments = [];

      // Uzbek names for realistic data
      const uzbekNames = {
        firstnames: [
          'Aziz', 'Karim', 'Nurmat', 'Rahim', 'Toshmat', 'Jamshid', 'Farrukh', 'Shavkat',
          'Dilshod', 'Rustam', 'Bekzod', 'Jahongir', 'Alisher', 'Sherzod', 'Murod',
          'Zarina', 'Malika', 'Dilfuza', 'Gulnora', 'Maftuna', 'Shahnoza', 'Nilufar',
          'Mukaddas', 'Zulfiya', 'Gulchehra'
        ],
        lastnames: [
          'Azizov', 'Karimov', 'Nurmatov', 'Rahimov', 'Toshmatov', 'Jamshidov', 'Farrukhov',
          'Shavkatov', 'Dilshodov', 'Rustamov', 'Bekzodov', 'Jahongirov', 'Alisherov',
          'Sherzodov', 'Murodov', 'Azizova', 'Karimova', 'Nurmatova', 'Rahimova',
          'Toshmatova', 'Jamshidova', 'Farrukhova', 'Shavkatova', 'Dilshodova', 'Rustamova'
        ]
      };

      // Create users for each company
      companies.forEach((company, companyIndex) => {
        const companyUsers = [];
        const companyUserRoles = [];

        // Create 4-5 users per company
        const userCount = Math.floor(Math.random() * 2) + 4; // 4-5 users

        for (let i = 0; i < userCount; i++) {
          const userId = uuidv4();
          
          // Use deterministic selection based on company index and user index
          const nameIndex = (companyIndex * 10 + i) % uzbekNames.firstnames.length;
          const lastnameIndex = (companyIndex * 10 + i) % uzbekNames.lastnames.length;
          
          const firstname = uzbekNames.firstnames[nameIndex];
          const lastname = uzbekNames.lastnames[lastnameIndex];
          
          // Add user index to ensure unique emails
          const email = `${firstname.toLowerCase()}.${lastname.toLowerCase()}${i + 1}@${company.name.toLowerCase().replace(/\s+/g, '')}.uz`;

          // Create user
          companyUsers.push({
            id: userId,
            email: email,
            password: bcrypt.hashSync('password123', 10),
            firstname: firstname,
            lastname: lastname,
            status: 'active',
            company_id: company.id,
            last_login: null,
            created_at: now,
            updated_at: now
          });

          // Assign roles based on position
          let roleId;
          if (i === 0) {
            // First user gets admin role
            roleId = roles.find(r => r.name === 'admin')?.id || roles[0].id;
          } else if (i === 1) {
            // Second user gets manager role
            roleId = roles.find(r => r.name === 'manager')?.id || roles[1]?.id || roles[0].id;
          } else if (i === 2) {
            // Third user gets cashier role
            roleId = roles.find(r => r.name === 'cashier')?.id || roles[2]?.id || roles[0].id;
          } else {
            // Other users get salesman role
            roleId = roles.find(r => r.name === 'salesman')?.id || roles[3]?.id || roles[0].id;
          }

          companyUserRoles.push({
            id: uuidv4(),
            user_id: userId,
            role_id: roleId,
            created_at: now,
            updated_at: now
          });
        }

        users.push(...companyUsers);
        userRoleAssignments.push(...companyUserRoles);

        console.log(`Created ${companyUsers.length} users for ${company.name}`);
      });

      // Insert users
      await queryInterface.bulkInsert('users', users, {});

      // Insert user role assignments
      await queryInterface.bulkInsert('user_role_assignments', userRoleAssignments, {});

      console.log('Development users created successfully!');
      console.log(`Total users created: ${users.length}`);
      console.log(`Total role assignments: ${userRoleAssignments.length}`);

    } catch (error) {
      console.error('Error creating development users:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing development users...');
      
      // Get Uzbek company IDs
      const uzbekCompanyIds = await queryInterface.sequelize.query(
        'SELECT id FROM companies WHERE name LIKE \'%Uzbek%\' OR name LIKE \'%Tashkent%\' OR name LIKE \'%Samarkand%\' OR name LIKE \'%Bukhara%\' OR name LIKE \'%Andijan%\' OR name LIKE \'%Fergana%\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (uzbekCompanyIds.length > 0) {
        const companyIds = uzbekCompanyIds.map(c => c.id);
        
        // Remove user role assignments for these companies
        await queryInterface.sequelize.query(
          'DELETE FROM user_role_assignments WHERE user_id IN (SELECT id FROM users WHERE company_id IN (?));',
          { replacements: [companyIds] }
        );

        // Remove users for these companies
        await queryInterface.bulkDelete('users', {
          company_id: companyIds
        }, {});
      }

      console.log('Development users removed successfully!');
    } catch (error) {
      console.error('Error removing development users:', error);
      throw error;
    }
  }
}; 