'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DirectoryRecord extends Model {
    static associate(models) {
      DirectoryRecord.belongsTo(models.CompanyDirectory, {
        foreignKey: 'company_directory_id',
        as: 'companyDirectory'
      });
      DirectoryRecord.hasMany(models.DirectoryValue, {
        foreignKey: 'directory_record_id',
        as: 'recordValues'
      });
    }
  }

  DirectoryRecord.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    company_directory_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'company_directories',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'DirectoryRecord',
    tableName: 'directory_records',
    timestamps: true,
    underscored: true
  });

  return DirectoryRecord;
};
