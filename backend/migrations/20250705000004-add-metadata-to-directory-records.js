'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('directory_records', 'metadata', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Record metadata such as cascading configurations, parent field info, etc.'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('directory_records', 'metadata');
  }
}; 