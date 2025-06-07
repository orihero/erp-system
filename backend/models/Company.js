'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {}
  Company.init({
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
    admin_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    employee_count: {
      type: DataTypes.ENUM('less_than_10', '10_to_50', '50_to_100', '100_to_500', '500_to_1000', 'more_than_1000'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tax_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    registration_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    founded_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    contacts: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      get() {
        const rawValue = this.getDataValue('contacts');
        return rawValue ? JSON.parse(JSON.stringify(rawValue)) : {};
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    timestamps: true,
    underscored: true
  });

  Company.associate = function(models) {
    Company.hasMany(models.User, { 
      foreignKey: 'company_id',
      as: 'users'
    });
    Company.belongsToMany(models.Directory, {
      through: 'company_directories',
      foreignKey: 'company_id',
      otherKey: 'directory_id',
      as: 'directories'
    });
    Company.belongsToMany(models.Module, {
      through: 'company_modules',
      foreignKey: 'company_id',
      otherKey: 'module_id',
      as: 'modules'
    });
  };

  return Company;
}; 