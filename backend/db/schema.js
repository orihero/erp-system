const sequelize = require("../config/database");

// Initialize database
const initializeDatabase = async () => {
  try {
    // Use alter: true instead of force: true to preserve existing data
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
};
