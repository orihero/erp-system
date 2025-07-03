'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('report_template_versions', {
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
        },
        onDelete: 'CASCADE'
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      changes: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      changeDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('report_template_versions', ['reportStructureId', 'version']);
    await queryInterface.addIndex('report_template_versions', ['createdBy']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('report_template_versions');
  }
}; 