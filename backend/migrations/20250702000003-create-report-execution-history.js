'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('report_execution_history', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      reportStructureId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'report_structures',
          key: 'id'
        }
      },
      parameters: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM('pending', 'running', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      outputPath: {
        type: Sequelize.STRING,
        allowNull: true
      },
      outputFormat: {
        type: Sequelize.STRING,
        allowNull: true
      },
      executionTime: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      executedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('report_execution_history', ['reportStructureId']);
    await queryInterface.addIndex('report_execution_history', ['executedBy']);
    await queryInterface.addIndex('report_execution_history', ['status']);
    await queryInterface.addIndex('report_execution_history', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('report_execution_history');
  }
}; 