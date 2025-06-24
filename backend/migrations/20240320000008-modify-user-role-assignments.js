'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop all existing foreign key constraints on company_id
    await queryInterface.sequelize.query(`
      DO $$
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (
          SELECT constraint_name
          FROM information_schema.constraint_column_usage
          WHERE table_name = 'user_role_assignments' AND column_name = 'company_id'
        ) LOOP
          EXECUTE 'ALTER TABLE "user_role_assignments" DROP CONSTRAINT IF EXISTS ' || r.constraint_name || ' CASCADE';
        END LOOP;
      END $$;
    `);
    // Alter column to allow NULLs
    await queryInterface.changeColumn('user_role_assignments', 'company_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
    // Always drop the constraint before adding
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_role_assignments" DROP CONSTRAINT IF EXISTS "user_role_assignments_company_id_fkey";
    `);
    // Re-add a single foreign key constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_role_assignments"
      ADD CONSTRAINT "user_role_assignments_company_id_fkey"
      FOREIGN KEY (company_id) REFERENCES companies(id)
      ON DELETE SET NULL ON UPDATE CASCADE;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Always drop the constraint before adding
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_role_assignments" DROP CONSTRAINT IF EXISTS "user_role_assignments_company_id_fkey";
    `);
    // Clean up rows with NULL company_id before making the column NOT NULL
    await queryInterface.sequelize.query('DELETE FROM user_role_assignments WHERE company_id IS NULL;');
    // Alter column to NOT NULL
    await queryInterface.changeColumn('user_role_assignments', 'company_id', {
      type: Sequelize.UUID,
      allowNull: false
    });
    // Always drop the constraint before adding
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_role_assignments" DROP CONSTRAINT IF EXISTS "user_role_assignments_company_id_fkey";
    `);
    // Re-add the original foreign key constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_role_assignments"
      ADD CONSTRAINT "user_role_assignments_company_id_fkey"
      FOREIGN KEY (company_id) REFERENCES companies(id)
      ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  }
}; 