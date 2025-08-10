const { Model, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

/**
 * ReportStructure Model
 * Represents the structure and configuration of a report template.
 *
 * Note: Some associations reference models that do not yet exist (ReportTemplateVersion, ReportExecutionHistory, ReportTemplateBinding).
 * These are commented out and should be enabled when those models are implemented.
 */
module.exports = (sequelize) => {
  class ReportStructure extends Model {
    /**
     * Define model associations
     * @param {object} models
     */
    static associate(models) {
      // User associations
      if (models.User) {
        ReportStructure.belongsTo(models.User, {
          foreignKey: "createdBy",
          as: "creator",
        });
        ReportStructure.belongsTo(models.User, {
          foreignKey: "updatedBy",
          as: "updater",
        });
      }
      // Company association
      if (models.Company) {
        ReportStructure.belongsTo(models.Company, {
          foreignKey: "companyId",
          as: "company",
        });
      }
      // Future associations (uncomment when models exist)
      if (models.ReportTemplateVersion) {
        ReportStructure.hasMany(models.ReportTemplateVersion, {
          foreignKey: "reportStructureId",
          as: "versions",
        });
      }
      if (models.ReportExecutionHistory) {
        ReportStructure.hasMany(models.ReportExecutionHistory, {
          foreignKey: "reportStructureId",
          as: "executions",
        });
      }
      if (models.ReportTemplateBinding) {
        ReportStructure.hasMany(models.ReportTemplateBinding, {
          foreignKey: "reportStructureId",
          as: "bindings",
        });
      }
    }

    /**
     * Validate a value against a simple JSON schema
     * @param {object} data
     * @param {object} schema
     * @returns {boolean}
     */
    static validateJSONSchema(data, schema) {
      if (!data || typeof data !== 'object') return false;
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in data)) return false;
        }
      }
      if (schema.properties) {
        for (const key in schema.properties) {
          if (schema.properties[key].enum && data[key] && !schema.properties[key].enum.includes(data[key])) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * (Future) Create a new version for this report structure
     * @param {object} changes
     * @param {string} userId
     * @returns {Promise<object>}
     */
    // async createVersion(changes, userId) {
    //   const ReportTemplateVersion = sequelize.models.ReportTemplateVersion;
    //   return await ReportTemplateVersion.create({
    //     reportStructureId: this.id,
    //     version: this.version,
    //     changes: changes,
    //     createdBy: userId
    //   });
    // }

    /**
     * (Future) Increment the version number
     * @param {string} userId
     * @returns {Promise<this>}
     */
    // async incrementVersion(userId) {
    //   this.version += 1;
    //   this.updatedBy = userId;
    //   return await this.save();
    // }

    /**
     * (Future) Get companies accessible via bindings
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    // async getAccessibleCompanies(userId) {
    //   const bindings = await this.getBindings({
    //     where: { isActive: true },
    //     include: ['company', 'module']
    //   });
    //   return bindings.map(binding => binding.company).filter(Boolean);
    // }
  }

  ReportStructure.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'custom',
        validate: {
          isIn: [['financial', 'operational', 'hr', 'sales', 'inventory', 'custom']],
        },
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      templateType: {
        type: DataTypes.ENUM('tabular', 'chart', 'dashboard', 'document'),
        allowNull: false,
        defaultValue: 'tabular',
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      // Enhanced JSONB configuration fields
      dataSourceConfig: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        validate: {
          isValidDataSourceConfig(value) {
            const schema = {
              required: ['type'],
              properties: {
                type: { enum: ['database', 'api', 'file'] }
              }
            };
            if (!ReportStructure.validateJSONSchema(value, schema)) {
              throw new Error('Invalid dataSourceConfig structure');
            }
          }
        }
      },
      layoutConfig: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: { sections: [] },
        validate: {
          isValidLayoutConfig(value) {
            const schema = {
              required: ['sections']
            };
            if (!ReportStructure.validateJSONSchema(value, schema)) {
              throw new Error('Invalid layoutConfig structure');
            }
          }
        }
      },
      parametersConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        validate: {
          isValidParametersConfig(value) {
            if (!Array.isArray(value)) {
              throw new Error('parametersConfig must be an array');
            }
          }
        }
      },
      outputConfig: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          formats: ['pdf'],
          scheduling: { enabled: false },
          distribution: { enabled: false }
        }
      },
      // Legacy fields for backward compatibility
      univerData: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      reportStructureData: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "companies",
          key: "id",
        },
      },
      estimatedUsageFrequency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      targetAudience: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      businessPurpose: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      complianceRequirements: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ReportStructure",
      tableName: "report_structures",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["name", "companyId"],
        },
        {
          fields: ["category"],
        },
        {
          fields: ["isActive"],
        },
        {
          fields: ["templateType"],
        },
        {
          using: 'gin',
          fields: ["dataSourceConfig"],
        },
        {
          using: 'gin',
          fields: ["layoutConfig"],
        },
        {
          using: 'gin',
          fields: ["tags"],
        },
      ]
    }
  );

  return ReportStructure;
};
