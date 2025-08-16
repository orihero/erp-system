'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the table
    await queryInterface.renameTable('excel_report_drafts', 'excel_report_templates');
    
    // Drop the old enum and create a new one
    await queryInterface.sequelize.query(`
      ALTER TABLE excel_report_templates 
      ALTER COLUMN status TYPE VARCHAR(20);
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE excel_report_templates 
      ALTER COLUMN status SET DEFAULT 'draft';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the enum changes
    await queryInterface.sequelize.query(`
      ALTER TABLE excel_report_templates 
      ALTER COLUMN status TYPE VARCHAR(20);
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE excel_report_templates 
      ALTER COLUMN status SET DEFAULT 'draft';
    `);
    
    // Rename the table back
    await queryInterface.renameTable('excel_report_templates', 'excel_report_drafts');
  }
};
