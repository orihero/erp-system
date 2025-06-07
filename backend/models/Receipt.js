'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {}
  Receipt.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isBeforeOrEqual(value) {
          if (value > new Date()) {
            throw new Error('Date cannot be in the future');
          }
        }
      }
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    payment_status: {
      type: DataTypes.ENUM('paid', 'pending'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Receipt',
    tableName: 'receipts',
    timestamps: true,
    underscored: true
  });
  return Receipt;
}; 