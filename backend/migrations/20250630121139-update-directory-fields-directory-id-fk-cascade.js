'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // Remove the existing foreign key constraint
    await queryInterface.removeConstraint('directory_fields', 'directory_fields_directory_id_fkey');
    // Add the new constraint with ON DELETE CASCADE
    await queryInterface.addConstraint('directory_fields', {
      fields: ['directory_id'],
      type: 'foreign key',
      name: 'directory_fields_directory_id_fkey',
      references: {
        table: 'directories',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove the CASCADE constraint
    await queryInterface.removeConstraint('directory_fields', 'directory_fields_directory_id_fkey');
    // Re-add the original constraint without CASCADE
    await queryInterface.addConstraint('directory_fields', {
      fields: ['directory_id'],
      type: 'foreign key',
      name: 'directory_fields_directory_id_fkey',
      references: {
        table: 'directories',
        field: 'id'
      },
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE'
    });
  }
};
