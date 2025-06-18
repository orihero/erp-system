'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      Permission.belongsTo(models.Module, {
        foreignKey: 'module_id',
        as: 'module'
      });
      Permission.belongsTo(models.Directory, {
        foreignKey: 'directory_id',
        as: 'directory'
      });
      Permission.hasMany(models.RolePermission, {
        foreignKey: 'permission_id',
        as: 'rolePermissions'
      });
    }
  }

  Permission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    module_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'modules',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    directory_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'directories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Permission;
}; 