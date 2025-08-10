'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('company_directories', 'module_id', {
        type: Sequelize.UUID,
        allowNull: true, // Set to true initially to allow existing rows to be updated
        references: {
          model: 'company_modules',
          key: 'id'
        },
        onDelete: 'SET NULL'
      });
    } catch (error) {
      // If column already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('company_directories', 'module_id');
  }
};
