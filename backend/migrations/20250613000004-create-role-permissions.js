
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
      },
      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
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
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    console.log('====================================');
    console.log('role_permissions table created');
    console.log('====================================');

    // All addConstraint calls are removed from here and will be moved to a new migration
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('role_permissions');
  }
};


