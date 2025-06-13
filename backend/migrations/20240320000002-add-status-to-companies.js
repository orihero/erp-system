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
    // Drop the ENUM type to prevent orphaned custom types in the database
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_companies_status";');
  }
};
