'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();
      console.log('Enabling modules for Uzbek companies...');

      // Get companies
      const companies = await queryInterface.sequelize.query(
        'SELECT id, name, industry FROM companies WHERE name LIKE \'%Uzbek%\' OR name LIKE \'%Tashkent%\' OR name LIKE \'%Samarkand%\' OR name LIKE \'%Bukhara%\' OR name LIKE \'%Andijan%\' OR name LIKE \'%Fergana%\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!companies || companies.length === 0) {
        throw new Error('No Uzbek companies found. Please run the companies seeder first.');
      }

      // Get all modules
      const modules = await queryInterface.sequelize.query(
        'SELECT id, name FROM modules;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!modules || modules.length === 0) {
        throw new Error('No modules found. Please run the production seeder first.');
      }

      const companyModules = [];

      // Define module selections based on industry
      const industryModules = {
        'Textiles': ['Dashboard', 'Inventory', 'Sales', 'Reports', 'Settings'],
        'Trade': ['Dashboard', 'Cashier', 'Sales', 'Reports', 'Settings'],
        'Agriculture': ['Dashboard', 'Inventory', 'Accounting', 'Reports', 'Settings'],
        'Manufacturing': ['Dashboard', 'Inventory', 'Purchases', 'Sales', 'Reports', 'Settings'],
        'Logistics': ['Dashboard', 'Inventory', 'Sales', 'Reports', 'Settings']
      };

      companies.forEach(company => {
        // Get modules for this company's industry
        const availableModules = industryModules[company.industry] || ['Dashboard', 'Settings'];
        
        // Randomly select 1-5 modules
        const moduleCount = Math.floor(Math.random() * 3) + 3; // 3-5 modules
        const selectedModules = availableModules.slice(0, moduleCount);

        selectedModules.forEach(moduleName => {
          const module = modules.find(m => m.name === moduleName);
          if (module) {
            companyModules.push({
              id: uuidv4(),
              company_id: company.id,
              module_id: module.id,
              is_enabled: true,
              created_at: now,
              updated_at: now
            });
          }
        });

        console.log(`Enabled ${selectedModules.length} modules for ${company.name} (${company.industry}): ${selectedModules.join(', ')}`);
      });

      await queryInterface.bulkInsert('company_modules', companyModules, {});

      console.log('Company modules enabled successfully!');
      console.log(`Total company-module assignments: ${companyModules.length}`);

    } catch (error) {
      console.error('Error enabling company modules:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing company module assignments...');
      
      // Get Uzbek company IDs
      const uzbekCompanyIds = await queryInterface.sequelize.query(
        'SELECT id FROM companies WHERE name LIKE \'%Uzbek%\' OR name LIKE \'%Tashkent%\' OR name LIKE \'%Samarkand%\' OR name LIKE \'%Bukhara%\' OR name LIKE \'%Andijan%\' OR name LIKE \'%Fergana%\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (uzbekCompanyIds.length > 0) {
        const companyIds = uzbekCompanyIds.map(c => c.id);
        await queryInterface.bulkDelete('company_modules', {
          company_id: companyIds
        }, {});
      }

      console.log('Company module assignments removed successfully!');
    } catch (error) {
      console.error('Error removing company module assignments:', error);
      throw error;
    }
  }
}; 