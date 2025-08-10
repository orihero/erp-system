'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('directory_fields', 'metadata', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Field metadata such as isVisibleOnTable, fieldOrder, etc.'
      });
    } catch (error) {
      // If column already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('directory_fields', 'metadata');
  }
}; 