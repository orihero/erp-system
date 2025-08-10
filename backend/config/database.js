require('dotenv').config();
const { Sequelize } = require("sequelize");

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "erp_db",
  dialect: process.env.DB_DIALECT || "postgres"
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // Add explicit UTF-8 charset configuration
    dialectOptions: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
  }
);

module.exports = sequelize;
