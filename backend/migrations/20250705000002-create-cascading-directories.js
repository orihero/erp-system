'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    try {
      // Create Payment Types Directory
      await queryInterface.bulkInsert('directories', [{
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Payment Types',
        icon_name: 'ph:credit-card',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: JSON.stringify({
          description: 'Different types of payments for receipts',
          cascadingEnabled: true
        })
      }]);
    } catch (error) {
      // If directory already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }

    try {
      // Create Inventory Directory
      await queryInterface.bulkInsert('directories', [{
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Inventory',
        icon_name: 'ph:warehouse',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: JSON.stringify({
          description: 'Inventory items for raw materials',
          cascadingEnabled: true
        })
      }]);
    } catch (error) {
      // If directory already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }

    try {
      // Create Raw Materials Directory
      await queryInterface.bulkInsert('directories', [{
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Raw Materials',
        icon_name: 'ph:package',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: JSON.stringify({
          description: 'Raw materials for different inventories',
          cascadingEnabled: true
        })
      }]);
    } catch (error) {
      // If directory already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }

    try {
      // Create Departments Directory
      await queryInterface.bulkInsert('directories', [{
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Departments',
        icon_name: 'ph:buildings',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: JSON.stringify({
          description: 'Company departments for employee salary payments',
          cascadingEnabled: true
        })
      }]);
    } catch (error) {
      // If directory already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }

    try {
      // Create Employees Directory
      await queryInterface.bulkInsert('directories', [{
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Employees',
        icon_name: 'ph:users',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: JSON.stringify({
          description: 'Employees organized by departments',
          cascadingEnabled: true
        })
      }]);
    } catch (error) {
      // If directory already exists, ignore the error
      if (!error.message.includes('уже существует') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // First, get the directory IDs for cascading directories
    const cascadingDirectories = await queryInterface.sequelize.query(
      'SELECT id FROM directories WHERE name IN (\'Payment Types\', \'Inventory\', \'Raw Materials\', \'Departments\', \'Employees\');',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (cascadingDirectories.length > 0) {
      const directoryIds = cascadingDirectories.map(dir => dir.id);

      // Delete related directory_values first (deepest child)
      await queryInterface.sequelize.query(
        'DELETE FROM directory_values WHERE directory_record_id IN (SELECT id FROM directory_records WHERE company_directory_id IN (SELECT id FROM company_directories WHERE directory_id = ANY($1)));',
        { bind: [directoryIds] }
      );

      // Delete related directory_records
      await queryInterface.sequelize.query(
        'DELETE FROM directory_records WHERE company_directory_id IN (SELECT id FROM company_directories WHERE directory_id = ANY($1));',
        { bind: [directoryIds] }
      );

      // Delete directory_fields that reference these directories as relation_id
      await queryInterface.sequelize.query(
        'DELETE FROM directory_fields WHERE relation_id = ANY($1);',
        { bind: [directoryIds] }
      );

      // Delete directory_fields that belong to these directories
      await queryInterface.sequelize.query(
        'DELETE FROM directory_fields WHERE directory_id = ANY($1);',
        { bind: [directoryIds] }
      );

      // Delete related company_directories
      await queryInterface.sequelize.query(
        'DELETE FROM company_directories WHERE directory_id = ANY($1);',
        { bind: [directoryIds] }
      );

      // Finally, delete the directories
      await queryInterface.sequelize.query(
        'DELETE FROM directories WHERE id = ANY($1);',
        { bind: [directoryIds] }
      );
    }
  }
}; 