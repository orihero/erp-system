'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the old constraint
    await queryInterface.removeConstraint('directory_values', 'directory_values_field_id_fkey');
    // Add the new constraint with ON DELETE CASCADE and ON UPDATE CASCADE
    await queryInterface.addConstraint('directory_values', {
      fields: ['field_id'],
      type: 'foreign key',
      name: 'directory_values_field_id_fkey',
      references: {
        table: 'directory_fields',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the cascade constraint
    await queryInterface.removeConstraint('directory_values', 'directory_values_field_id_fkey');
    // Add the original constraint (no cascade)
    await queryInterface.addConstraint('directory_values', {
      fields: ['field_id'],
      type: 'foreign key',
      name: 'directory_values_field_id_fkey',
      references: {
        table: 'directory_fields',
        field: 'id'
      }
      // No onDelete or onUpdate
    });
  }
}; 