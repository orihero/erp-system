'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. Drop existing enum types if they exist
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_directory_fields_type_new CASCADE`);
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_directory_fields_type CASCADE`);
      
      // 2. Create the new ENUM type
      await queryInterface.sequelize.query(`CREATE TYPE enum_directory_fields_type_new AS ENUM ('text', 'file', 'bool', 'date', 'time', 'datetime', 'json', 'relation', 'decimal', 'integer', 'number', 'string', 'email', 'tel', 'select', 'textarea')`);
      
      // 3. Alter the column to use the new ENUM type
      await queryInterface.sequelize.query(`ALTER TABLE directory_fields ALTER COLUMN type TYPE enum_directory_fields_type_new USING type::text::enum_directory_fields_type_new`);
      
      // 4. Rename the new type to the expected name
      await queryInterface.sequelize.query(`ALTER TYPE enum_directory_fields_type_new RENAME TO enum_directory_fields_type`);
    } catch (error) {
      // If column doesn't exist or other issues, ignore the error
      if (!error.message.includes('не существует') && !error.message.includes('does not exist')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Alter the column back to STRING
    await queryInterface.sequelize.query(`ALTER TABLE directory_fields ALTER COLUMN type TYPE VARCHAR(255)`);
    // 2. Drop the ENUM type
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_directory_fields_type`);
  }
}; 