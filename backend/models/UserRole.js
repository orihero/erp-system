'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    static associate(models) {
      UserRole.belongsToMany(models.User, {
        through: models.UserRoleAssignment,
        foreignKey: 'role_id',
        otherKey: 'user_id',
        as: 'users'
      });
    }
  }

  UserRole.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_roles',
    timestamps: true,
    underscored: true
  });

  return UserRole;
}; 