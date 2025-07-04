'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DirectoryField extends Model {
    static associate(models) {
      // Define associations here
      DirectoryField.belongsTo(models.Directory, {
        foreignKey: 'directory_id',
        as: 'directory'
      });
      DirectoryField.belongsTo(models.Directory, {
        foreignKey: 'relation_id',
        as: 'relation'
      });
      DirectoryField.hasMany(models.DirectoryValue, {
        foreignKey: 'field_id',
        as: 'fieldValues'
      });
    }
  }

  DirectoryField.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    directory_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'directories',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM(
        'string',
        'number',
        'file',
        'bool',
        'date',
        'time',
        'json',
        'datetime',
        'relation',
        'text',
        'decimal',
        'integer'
      ),
      allowNull: false
    },
    relation_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'directories',
        key: 'id'
      },
      validate: {
        relationRequired(value) {
          if (this.type === 'relation' && !value) {
            throw new Error('Relation ID is required when type is relation');
          }
        }
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
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Field metadata such as isVisibleOnTable, fieldOrder, etc.'
    }
  }, {
    sequelize,
    modelName: 'DirectoryField',
    tableName: 'directory_fields',
    timestamps: true,
    underscored: true
  });

  return DirectoryField;
};
