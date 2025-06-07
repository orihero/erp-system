const sequelize = require("../config/database");

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
};
