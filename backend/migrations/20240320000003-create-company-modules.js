'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('company_modules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      module_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'modules',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add unique constraint to prevent duplicate assignments
    await queryInterface.addIndex('company_modules', ['company_id', 'module_id'], {
      unique: true,
      name: 'company_modules_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('company_modules');
  }
}; 