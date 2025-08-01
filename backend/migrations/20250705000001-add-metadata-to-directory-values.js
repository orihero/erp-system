'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if metadata column exists before trying to remove it
    const tableDescription = await queryInterface.describeTable('directory_values');
    if (tableDescription.metadata) {
      await queryInterface.removeColumn('directory_values', 'metadata');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if metadata column doesn't exist before adding it
    const tableDescription = await queryInterface.describeTable('directory_values');
    if (!tableDescription.metadata) {
      await queryInterface.addColumn('directory_values', 'metadata', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Value metadata such as cascading configurations, validation rules, etc.'
      });
    }
  }
}; 