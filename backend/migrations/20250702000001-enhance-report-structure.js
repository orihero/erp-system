'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to existing report_structures table
    await queryInterface.addColumn('report_structures', 'category', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'custom',
      validate: {
        isIn: [['financial', 'operational', 'hr', 'sales', 'inventory', 'custom']]
      }
    });

    await queryInterface.addColumn('report_structures', 'version', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    await queryInterface.addColumn('report_structures', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    await queryInterface.addColumn('report_structures', 'templateType', {
      type: Sequelize.ENUM('tabular', 'chart', 'dashboard', 'document'),
      allowNull: false,
      defaultValue: 'tabular'
    });

    await queryInterface.addColumn('report_structures', 'tags', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('report_structures', 'dataSourceConfig', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {}
    });

    await queryInterface.addColumn('report_structures', 'layoutConfig', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: { sections: [] }
    });

    await queryInterface.addColumn('report_structures', 'parametersConfig', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('report_structures', 'outputConfig', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {
        formats: ['pdf'],
        scheduling: { enabled: false },
        distribution: { enabled: false }
      }
    });

    await queryInterface.addColumn('report_structures', 'updatedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('report_structures', 'estimatedUsageFrequency', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('report_structures', 'targetAudience', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('report_structures', 'businessPurpose', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('report_structures', 'complianceRequirements', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add indexes for performance
    await queryInterface.addIndex('report_structures', ['category']);
    await queryInterface.addIndex('report_structures', ['isActive']);
    await queryInterface.addIndex('report_structures', ['templateType']);
    await queryInterface.addIndex('report_structures', {
      fields: ['dataSourceConfig'],
      using: 'gin'
    });
    await queryInterface.addIndex('report_structures', {
      fields: ['layoutConfig'],
      using: 'gin'
    });
    await queryInterface.addIndex('report_structures', {
      fields: ['tags'],
      using: 'gin'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns
    await queryInterface.removeColumn('report_structures', 'category');
    await queryInterface.removeColumn('report_structures', 'version');
    await queryInterface.removeColumn('report_structures', 'isActive');
    await queryInterface.removeColumn('report_structures', 'templateType');
    await queryInterface.removeColumn('report_structures', 'tags');
    await queryInterface.removeColumn('report_structures', 'dataSourceConfig');
    await queryInterface.removeColumn('report_structures', 'layoutConfig');
    await queryInterface.removeColumn('report_structures', 'parametersConfig');
    await queryInterface.removeColumn('report_structures', 'outputConfig');
    await queryInterface.removeColumn('report_structures', 'updatedBy');
    await queryInterface.removeColumn('report_structures', 'estimatedUsageFrequency');
    await queryInterface.removeColumn('report_structures', 'targetAudience');
    await queryInterface.removeColumn('report_structures', 'businessPurpose');
    await queryInterface.removeColumn('report_structures', 'complianceRequirements');
  }
}; 