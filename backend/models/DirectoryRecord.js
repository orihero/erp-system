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

    // Helper method to get cascading configuration
    getCascadingConfig() {
      return this.metadata?.cascadingConfig || null;
    }

    // Helper method to check if cascading is enabled
    isCascadingEnabled() {
      const config = this.getCascadingConfig();
      return config?.enabled || false;
    }

    // Helper method to get dependent fields
    getDependentFields() {
      const config = this.getCascadingConfig();
      return config?.dependentFields || [];
    }

    // Helper method to get parent field value
    getParentFieldValue() {
      return this.metadata?.parentFieldValue || null;
    }

    // Helper method to get parent field ID
    getParentFieldId() {
      return this.metadata?.parentFieldId || null;
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
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Record metadata such as cascading configurations, parent field info, etc.'
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
