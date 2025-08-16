'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('excel_report_templates', 'selected_modules', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      });
    } catch (error) {
      // If column already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('excel_report_templates', 'selected_modules');
  }
};
