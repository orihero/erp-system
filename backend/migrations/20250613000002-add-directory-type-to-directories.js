'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('directories', 'directory_type', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Company',
      });
    } catch (error) {
      // If column already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('directories', 'directory_type');
  }
}; 