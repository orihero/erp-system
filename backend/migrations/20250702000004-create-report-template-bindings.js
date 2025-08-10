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

    try {
      await queryInterface.addIndex('report_template_bindings', ['reportStructureId'], {
        name: 'report_template_bindings_report_structure_id'
      });
    } catch (error) {
      // If index already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('report_template_bindings', ['companyId'], {
        name: 'report_template_bindings_company_id'
      });
    } catch (error) {
      // If index already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('report_template_bindings', ['moduleId'], {
        name: 'report_template_bindings_module_id'
      });
    } catch (error) {
      // If index already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('report_template_bindings', ['bindingType'], {
        name: 'report_template_bindings_binding_type'
      });
    } catch (error) {
      // If index already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('report_template_bindings', ['isActive'], {
        name: 'report_template_bindings_is_active'
      });
    } catch (error) {
      // If index already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
    
    // Unique constraint to prevent duplicate bindings
    try {
      await queryInterface.addIndex('report_template_bindings', {
        fields: ['reportStructureId', 'companyId', 'moduleId'],
        unique: true,
        name: 'unique_template_binding'
      });
    } catch (error) {
      // If index already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('report_template_bindings');
  }
}; 