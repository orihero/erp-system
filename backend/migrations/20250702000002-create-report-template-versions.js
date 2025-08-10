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

    try {
      await queryInterface.addIndex('report_template_versions', ['reportStructureId', 'version'], {
        unique: true,
        name: 'report_template_versions_report_structure_id_version'
      });
    } catch (error) {
      // If index already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('report_template_versions', ['createdBy'], {
        name: 'report_template_versions_created_by'
      });
    } catch (error) {
      // If index already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('report_template_versions');
  }
}; 