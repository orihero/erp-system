'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExcelReportTemplate extends Model {
    static associate(models) {
      // Define associations here
      ExcelReportTemplate.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });
      
      ExcelReportTemplate.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      ExcelReportTemplate.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
      
      ExcelReportTemplate.belongsTo(models.User, {
        foreignKey: 'uploaded_by',
        as: 'uploader'
      });
    }
  }
  
  ExcelReportTemplate.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    selected_directories: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    selected_modules: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'draft',
      allowNull: false
    },
    uploaded_file_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uploaded_file_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'ExcelReportTemplate',
    tableName: 'excel_report_templates',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['company_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_by']
      }
    ]
  });
  
  return ExcelReportTemplate;
};
