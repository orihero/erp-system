'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('user_roles', [
      {
        id: uuidv4(),
        name: 'owner',
        description: 'Company Owner',
        is_system: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_roles', { name: 'owner' }, {});
  }
}; 