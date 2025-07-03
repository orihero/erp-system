'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('report_template_bindings', {
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
      companyId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      moduleId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'modules',
          key: 'id'
        }
      },
      bindingType: {
        type: Sequelize.ENUM('company', 'module', 'company_module', 'global'),
        allowNull: false,
        defaultValue: 'company'
      },
      accessLevel: {
        type: Sequelize.ENUM('read', 'execute', 'modify', 'admin'),
        allowNull: false,
        defaultValue: 'execute'
      },
      inheritanceEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      customizationAllowed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('report_template_bindings', ['reportStructureId']);
    await queryInterface.addIndex('report_template_bindings', ['companyId']);
    await queryInterface.addIndex('report_template_bindings', ['moduleId']);
    await queryInterface.addIndex('report_template_bindings', ['bindingType']);
    await queryInterface.addIndex('report_template_bindings', ['isActive']);
    
    // Unique constraint to prevent duplicate bindings
    await queryInterface.addIndex('report_template_bindings', {
      fields: ['reportStructureId', 'companyId', 'moduleId'],
      unique: true,
      name: 'unique_template_binding'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('report_template_bindings');
  }
}; 