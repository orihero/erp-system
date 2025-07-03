const { Model, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  class ReportTemplateVersion extends Model {
    static associate(models) {
      ReportTemplateVersion.belongsTo(models.ReportStructure, {
        foreignKey: "reportStructureId",
        as: "template",
      });
      
      ReportTemplateVersion.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });
    }
  }

  ReportTemplateVersion.init(
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
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      changes: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      changeDescription: {
        type: DataTypes.TEXT,
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
    },
    {
      sequelize,
      modelName: "ReportTemplateVersion",
      tableName: "report_template_versions",
      timestamps: true,
      updatedAt: false, // Only track creation time
      indexes: [
        {
          fields: ["reportStructureId", "version"],
        },
        {
          fields: ["createdBy"],
        },
      ],
    }
  );

  return ReportTemplateVersion;
}; 