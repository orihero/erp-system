'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CompanyDirectory extends Model {
    static associate(models) {
      // Define associations here
      CompanyDirectory.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });
      CompanyDirectory.belongsTo(models.Directory, {
        foreignKey: 'directory_id',
        as: 'directory'
      });
      CompanyDirectory.belongsTo(models.CompanyModule, {
        foreignKey: 'module_id',
        as: 'companyModule'
      });
      CompanyDirectory.hasMany(models.DirectoryValue, {
        foreignKey: 'company_directory_id',
        as: 'directoryValues'
      });
    }
  }

  CompanyDirectory.init({
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
    directory_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'directories',
        key: 'id'
      }
    },
    module_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'company_modules',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'CompanyDirectory',
    tableName: 'company_directories',
    timestamps: true,
    underscored: true
  });

  return CompanyDirectory;
};
