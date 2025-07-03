const { Model, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  class ReportExecutionHistory extends Model {
    static associate(models) {
      ReportExecutionHistory.belongsTo(models.ReportStructure, {
        foreignKey: "reportStructureId",
        as: "template",
      });
      
      ReportExecutionHistory.belongsTo(models.User, {
        foreignKey: "executedBy",
        as: "executor",
      });
    }

    // Instance methods
    async markAsRunning() {
      this.status = 'running';
      this.startedAt = new Date();
      return await this.save();
    }

    async markAsCompleted(outputPath, outputFormat, executionTime) {
      this.status = 'completed';
      this.completedAt = new Date();
      this.outputPath = outputPath;
      this.outputFormat = outputFormat;
      this.executionTime = executionTime;
      return await this.save();
    }

    async markAsFailed(errorMessage) {
      this.status = 'failed';
      this.completedAt = new Date();
      this.errorMessage = errorMessage;
      return await this.save();
    }
  }

  ReportExecutionHistory.init(
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
      parameters: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      status: {
        type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      outputPath: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      outputFormat: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      executionTime: {
        type: DataTypes.INTEGER, // milliseconds
        allowNull: true,
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      executedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ReportExecutionHistory",
      tableName: "report_execution_history",
      timestamps: true,
      indexes: [
        {
          fields: ["reportStructureId"],
        },
        {
          fields: ["executedBy"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    }
  );

  return ReportExecutionHistory;
}; 