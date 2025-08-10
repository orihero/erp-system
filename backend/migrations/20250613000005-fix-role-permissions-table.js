'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Clean up user_role_assignments with NULL company_id to avoid migration issues
    await queryInterface.sequelize.query('DELETE FROM user_role_assignments WHERE company_id IS NULL;');
    // Drop the table if it exists
    await queryInterface.dropTable('role_permissions', { force: true }).catch(() => {});
    // Recreate the table with the correct columns
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_roles',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      effective_from: {
        type: Sequelize.DATE,
        allowNull: true
      },
      effective_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      constraint_data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
    // Add unique constraint if it doesn't already exist
    try {
      await queryInterface.addConstraint('role_permissions', {
        fields: ['role_id', 'permission_id'],
        type: 'unique',
        name: 'unique_role_permission'
      });
    } catch (error) {
      // If constraint already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('role_permissions');
  }
}; 