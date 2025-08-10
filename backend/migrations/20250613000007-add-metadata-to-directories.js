'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('directories', 'metadata', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Directory metadata such as settings, component to render, etc.'
      });
    } catch (error) {
      // If column already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('directories', 'metadata');
  }
}; 