'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      // Define associations here
      RolePermission.belongsTo(models.UserRole, {
        foreignKey: 'role_id',
        as: 'role'
      });
      RolePermission.belongsTo(models.Permission, {
        foreignKey: 'permission_id',
        as: 'permission'
      });
    }
  }

  RolePermission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_roles',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    effective_from: {
      type: DataTypes.DATE,
      allowNull: true
    },
    effective_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    constraint_data: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'role_permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return RolePermission;
}; 