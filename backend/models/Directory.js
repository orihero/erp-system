'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Directory extends Model {
    static associate(models) {
      // Define associations here
      Directory.hasMany(models.CompanyDirectory, {
        foreignKey: 'directory_id',
        as: 'companyDirectories'
      });
      Directory.hasMany(models.DirectoryField, {
        foreignKey: 'directory_id',
        as: 'fields'
      });
    }
  }

  Directory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    icon_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    directory_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["Module", "Company", "System"]],
        notEmpty: true
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    sequelize,
    modelName: 'Directory',
    tableName: 'directories',
    timestamps: true,
    underscored: true,
    created_at: 'created_at',
    updated_at: 'updated_at'
  });

  return Directory;
}; 