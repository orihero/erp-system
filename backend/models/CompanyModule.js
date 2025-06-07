'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CompanyModule extends Model {
    static associate(models) {
      CompanyModule.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });
      CompanyModule.belongsTo(models.Module, {
        foreignKey: 'module_id',
        as: 'module'
      });
    }
  }

  CompanyModule.init({
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
    module_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'modules',
        key: 'id'
      }
    },
    is_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'CompanyModule',
    tableName: 'company_modules',
    timestamps: true,
    underscored: true
  });

  return CompanyModule;
}; 