'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // Get the receipts directory ID from the existing directories
    const receiptsDirectory = await queryInterface.sequelize.query(
      `SELECT id FROM directories WHERE name = 'Receipts' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (receiptsDirectory.length === 0) {
      console.log('Receipts directory not found, skipping payment type field creation');
      return;
    }

    const receiptsDirId = receiptsDirectory[0].id;

    // Add Payment Type field to Receipts directory
    try {
      await queryInterface.bulkInsert('directory_fields', [{
        id: Sequelize.literal('gen_random_uuid()'),
        directory_id: receiptsDirId,
        name: 'payment_type',
        type: 'select',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: JSON.stringify({
          isVisibleOnTable: true,
          fieldOrder: 5,
          isEditable: true,
          isFilterable: true,
          isCascadingTrigger: true,
          cascadingDirectoryId: 'payment-types-directory'
        })
      }]);
    } catch (error) {
      // If field already exists or table doesn't exist, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists') && 
          !error.message.includes('не существует') && !error.message.includes('does not exist')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('directory_fields', {
      name: 'payment_type'
    });
  }
}; 