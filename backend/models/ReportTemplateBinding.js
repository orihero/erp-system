const { Model, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  class ReportTemplateBinding extends Model {
    static associate(models) {
      ReportTemplateBinding.belongsTo(models.ReportStructure, {
        foreignKey: "reportStructureId",
        as: "template",
      });
      
      ReportTemplateBinding.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
      
      ReportTemplateBinding.belongsTo(models.Module, {
        foreignKey: "moduleId",
        as: "module",
      });
      
      ReportTemplateBinding.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });
    }

    // Class methods
    static async getTemplatesForUser(userId, companyId, moduleIds = []) {
      const { User, Company, Module } = sequelize.models;
      
      const whereClause = {
        isActive: true,
        [sequelize.Sequelize.Op.or]: [
          { companyId: companyId },
          { bindingType: 'global' }
        ]
      };

      if (moduleIds.length > 0) {
        whereClause[sequelize.Sequelize.Op.or].push({
          moduleId: { [sequelize.Sequelize.Op.in]: moduleIds }
        });
      }

      return await ReportTemplateBinding.findAll({
        where: whereClause,
        include: [
          { model: sequelize.models.ReportStructure, as: 'template' },
          { model: Company, as: 'company' },
          { model: Module, as: 'module' }
        ]
      });
    }

    // Instance methods
    async checkUserAccess(userId) {
      // Implementation would check if user has access based on company/module membership
      // This is a simplified version
      return true;
    }
  }

  ReportTemplateBinding.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      reportStructureId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "report_structures",
          key: "id",
        },
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "companies",
          key: "id",
        },
      },
      moduleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "modules",
          key: "id",
        },
      },
      bindingType: {
        type: DataTypes.ENUM('company', 'module', 'company_module', 'global'),
        allowNull: false,
        defaultValue: 'company',
      },
      accessLevel: {
        type: DataTypes.ENUM('read', 'execute', 'modify', 'admin'),
        allowNull: false,
        defaultValue: 'execute',
      },
      inheritanceEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      customizationAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "ReportTemplateBinding",
      tableName: "report_template_bindings",
      timestamps: true,
      indexes: [
        {
          fields: ["reportStructureId"],
        },
        {
          fields: ["companyId"],
        },
        {
          fields: ["moduleId"],
        },
        {
          fields: ["bindingType"],
        },
        {
          fields: ["isActive"],
        },
        {
          unique: true,
          fields: ["reportStructureId", "companyId", "moduleId"],
          name: "unique_template_binding"
        }
      ],
    }
  );

  return ReportTemplateBinding;
}; 