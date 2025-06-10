const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class ReportStructure extends Model {
    static associate(models) {
      // Define associations here
      if (models.User) {
        ReportStructure.belongsTo(models.User, {
          foreignKey: 'createdBy',
          as: 'creator'
        });
      }
    }
  }

  ReportStructure.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    univerData: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    reportStructureData: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'ReportStructure',
    tableName: 'ReportStructures',
    timestamps: true, // This will automatically add createdAt and updatedAt
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  return ReportStructure;
}; 