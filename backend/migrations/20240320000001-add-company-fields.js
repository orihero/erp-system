'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'logo', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('companies', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('companies', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('companies', 'website', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('companies', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('companies', 'tax_id', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('companies', 'registration_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('companies', 'industry', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('companies', 'founded_year', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('companies', 'contacts', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'logo');
    await queryInterface.removeColumn('companies', 'address');
    await queryInterface.removeColumn('companies', 'description');
    await queryInterface.removeColumn('companies', 'website');
    await queryInterface.removeColumn('companies', 'phone');
    await queryInterface.removeColumn('companies', 'tax_id');
    await queryInterface.removeColumn('companies', 'registration_number');
    await queryInterface.removeColumn('companies', 'industry');
    await queryInterface.removeColumn('companies', 'founded_year');
    await queryInterface.removeColumn('companies', 'contacts');
  }
}; 