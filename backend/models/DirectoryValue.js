'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DirectoryValue extends Model {
    static associate(models) {
      // Define associations here
      DirectoryValue.belongsTo(models.CompanyDirectory, {
        foreignKey: 'company_directory_id',
        as: 'companyDirectory'
      });
      DirectoryValue.belongsTo(models.DirectoryField, {
        foreignKey: 'field_id',
        as: 'field'
      });
    }

    // Helper method to cast value based on field type
    async getCastValue() {
      const field = await this.getField();
      const type = field.type;
      const value = this.value;

      switch (type) {
        case 'number':
        case 'integer':
          return parseInt(value, 10);
        case 'decimal':
          return parseFloat(value);
        case 'bool':
          return value === 'true';
        case 'date':
          return new Date(value);
        case 'datetime':
          return new Date(value);
        case 'json':
          return JSON.parse(value);
        case 'file':
          return value; // URL or file path
        default:
          return value;
      }
    }
  }

  DirectoryValue.init({
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
    },
    field_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'directory_fields',
        key: 'id'
      }
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'DirectoryValue',
    tableName: 'directory_values',
    timestamps: true,
    underscored: true
  });

  return DirectoryValue;
}; 