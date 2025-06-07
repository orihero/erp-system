'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Module extends Model {
    static associate(models) {
      Module.belongsToMany(models.Company, {
        through: 'company_modules',
        foreignKey: 'module_id',
        otherKey: 'company_id',
        as: 'companies'
      });
    }
  }
  
  Module.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    icon_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cube'
    }
  }, {
    sequelize,
    modelName: 'Module',
    tableName: 'modules',
    timestamps: true,
    underscored: true
  });
  return Module;
}; 