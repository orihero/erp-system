'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const modelDefiner = require(path.join(__dirname, file));
    const model = modelDefiner(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define associations
db.Company.hasMany(db.CompanyDirectory, {
  foreignKey: 'company_id',
  as: 'companyDirectories'
});

db.Directory.hasMany(db.CompanyDirectory, {
  foreignKey: 'directory_id',
  as: 'companyDirectories2'
});

db.Directory.hasMany(db.DirectoryField, {
  foreignKey: 'directory_id',
  as: 'fields2'
});

db.Directory.hasMany(db.DirectoryField, {
  foreignKey: 'relation_id',
  as: 'relatedFields'
});

db.CompanyDirectory.hasMany(db.DirectoryRecord, {
  foreignKey: 'company_directory_id',
  as: 'directoryRecords'
});

db.DirectoryRecord.hasMany(db.DirectoryValue, {
  foreignKey: 'directory_record_id',
  as: 'recordValues'
});

db.DirectoryField.hasMany(db.DirectoryValue, {
  foreignKey: 'field_id',
  as: 'values2'
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
