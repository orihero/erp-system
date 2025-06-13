'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the icon_name column exists
    const tableInfo = await queryInterface.describeTable('modules');
    if (!tableInfo.icon_name) {
      // Add icon_name to modules table if it doesn't exist
      await queryInterface.addColumn('modules', 'icon_name', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'cube' // Default icon
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Check if the icon_name column exists before attempting to remove it
      const tableInfo = await queryInterface.describeTable('modules');
      if (tableInfo.icon_name) {
        await queryInterface.removeColumn('modules', 'icon_name');
      }
    } catch (error) {
      console.error('Error in migration down method:', error);
      throw error;
    }
  }
};
