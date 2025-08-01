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
    try {
      await queryInterface.addIndex('company_modules', ['company_id', 'module_id'], {
        unique: true,
        name: 'company_modules_unique'
      });
    } catch (error) {
      // If index already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the unique index first
    try {
      await queryInterface.removeIndex('company_modules', 'company_modules_unique');
    } catch (error) {
      console.log('Note: Unique index may have already been removed or does not exist', error.message);
    }
    
    // Remove foreign key constraint from company_directories that references company_modules
    try {
      await queryInterface.removeConstraint('company_directories', 'company_directories_company_module_id_fkey');
    } catch (error) {
      console.log('Note: Foreign key constraint may have already been removed or does not exist', error.message);
    }
    
    // Drop the company_modules table
    try {
      await queryInterface.dropTable('company_modules');
    } catch (error) {
      console.error('Failed to drop table company_modules:', error.message);
      throw error;
    }
  }
};
