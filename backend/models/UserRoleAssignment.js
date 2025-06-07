'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserRoleAssignment extends Model {
    static associate(models) {
      UserRoleAssignment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      UserRoleAssignment.belongsTo(models.UserRole, {
        foreignKey: 'role_id',
        as: 'role'
      });
      UserRoleAssignment.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });
    }
  }

  UserRoleAssignment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_roles',
        key: 'id'
      }
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserRoleAssignment',
    tableName: 'user_role_assignments',
    timestamps: true,
    underscored: true
  });

  return UserRoleAssignment;
}; 