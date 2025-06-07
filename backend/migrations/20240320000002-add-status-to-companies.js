'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'status');
  }
}; 