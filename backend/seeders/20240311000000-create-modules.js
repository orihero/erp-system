'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('modules', null, {});
    const modules = [
      {
        id: uuidv4(),
        name: 'Dashboard',
        icon_name: 'material-symbols:dashboard',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Cashier',
        icon_name: 'material-symbols:point-of-sale',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Inventory',
        icon_name: 'material-symbols:inventory',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Realization',
        icon_name: 'material-symbols:trending-up',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Accounting',
        icon_name: 'material-symbols:account-balance',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Purchases',
        icon_name: 'material-symbols:shopping-cart',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sales',
        icon_name: 'material-symbols:store',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Reports',
        icon_name: 'material-symbols:assessment',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Settings',
        icon_name: 'material-symbols:settings',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('modules', modules, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('modules', null, {});
  }
}; 