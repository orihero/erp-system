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
    await queryInterface.removeColumn('modules', 'icon_name');
  }
}; 