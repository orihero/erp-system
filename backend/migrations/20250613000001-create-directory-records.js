'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create directory_records table
    await queryInterface.createTable('directory_records', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      company_directory_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'company_directories',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add directory_record_id column to directory_values table
    await queryInterface.addColumn('directory_values', 'directory_record_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'directory_records',
        key: 'id'
      }
    });

    // Remove company_directory_id column from directory_values table
    await queryInterface.removeColumn('directory_values', 'company_directory_id');
  },

  async down(queryInterface, Sequelize) {
    // Add back company_directory_id column to directory_values table
    await queryInterface.addColumn('directory_values', 'company_directory_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'company_directories',
        key: 'id'
      }
    });

    // Remove directory_record_id column from directory_values table
    await queryInterface.removeColumn('directory_values', 'directory_record_id');

    // Drop directory_records table
    await queryInterface.dropTable('directory_records');
  }
};
