'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('directories', 'directory_type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Company',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('directories', 'directory_type');
  }
}; 