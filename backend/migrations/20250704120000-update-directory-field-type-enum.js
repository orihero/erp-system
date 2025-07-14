'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create the new ENUM type
    await queryInterface.sequelize.query(`CREATE TYPE enum_directory_fields_type_new AS ENUM ('text', 'file', 'bool', 'date', 'time', 'datetime', 'json', 'relation', 'decimal', 'integer')`);
    // 2. Alter the column to use the new ENUM type
    await queryInterface.sequelize.query(`ALTER TABLE directory_fields ALTER COLUMN type TYPE enum_directory_fields_type_new USING type::text::enum_directory_fields_type_new`);
    // 3. Drop the old type if it exists (optional, only if you previously had an ENUM)
    // await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_directory_fields_type`);
    // 4. Rename the new type to the expected name
    await queryInterface.sequelize.query(`ALTER TYPE enum_directory_fields_type_new RENAME TO enum_directory_fields_type`);
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Alter the column back to STRING
    await queryInterface.sequelize.query(`ALTER TABLE directory_fields ALTER COLUMN type TYPE VARCHAR(255)`);
    // 2. Drop the ENUM type
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_directory_fields_type`);
  }
}; 