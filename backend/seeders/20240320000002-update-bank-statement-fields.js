'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Get the Bank Statement directory
    const [bankStatementDir] = await queryInterface.sequelize.query(
      "SELECT id FROM directories WHERE name = 'Bank Statement' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!bankStatementDir) {
      throw new Error('Bank Statement directory not found');
    }

    // Remove existing Bank Statement fields
    await queryInterface.sequelize.query(
      "DELETE FROM directory_fields WHERE directory_id = :directoryId",
      {
        replacements: { directoryId: bankStatementDir.id },
        type: queryInterface.sequelize.QueryTypes.DELETE
      }
    );

    // Add new Bank Statement fields based on Excel structure
    const bankStatementFields = [
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'fileName',
        type: 'string',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 0,
          isEditable: false,
          isFilterable: true,
          description: 'Auto-generated from filename and timestamp'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'documentDate',
        type: 'date',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 1,
          isEditable: true,
          isFilterable: true,
          description: 'Document date from bank statement'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'account',
        type: 'string',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 2,
          isEditable: true,
          isFilterable: true,
          description: 'Bank account number'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'organizationName',
        type: 'string',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 3,
          isEditable: true,
          isFilterable: true,
          description: 'Organization name'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'documentNumber',
        type: 'integer',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 4,
          isEditable: true,
          isFilterable: true,
          description: 'Document number'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'documentType',
        type: 'integer',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 5,
          isEditable: true,
          isFilterable: true,
          description: 'Document type code'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'branch',
        type: 'integer',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 6,
          isEditable: true,
          isFilterable: true,
          description: 'Branch code'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'debitTurnover',
        type: 'decimal',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 7,
          isEditable: true,
          isFilterable: true,
          description: 'Debit turnover amount'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'creditTurnover',
        type: 'decimal',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 8,
          isEditable: true,
          isFilterable: true,
          description: 'Credit turnover amount'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'paymentPurpose',
        type: 'text',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: false,
          fieldOrder: 9,
          isEditable: true,
          isFilterable: true,
          description: 'Payment purpose description'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'cashSymbol',
        type: 'integer',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: false,
          fieldOrder: 10,
          isEditable: true,
          isFilterable: true,
          description: 'Cash symbol code (optional)'
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'taxId',
        type: 'string',
        relation_id: null,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 11,
          isEditable: true,
          isFilterable: true,
          description: 'Tax identification number'
        }
      }
    ];

    // Stringify metadata for each field
    bankStatementFields.forEach(field => {
      if (field.metadata) {
        field.metadata = JSON.stringify(field.metadata);
      }
    });
    // Insert new fields
    await queryInterface.bulkInsert('directory_fields', bankStatementFields);
  },

  down: async (queryInterface, Sequelize) => {
    // Get the Bank Statement directory
    const [bankStatementDir] = await queryInterface.sequelize.query(
      "SELECT id FROM directories WHERE name = 'Bank Statement' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (bankStatementDir) {
      // Remove the new fields
      await queryInterface.sequelize.query(
        "DELETE FROM directory_fields WHERE directory_id = :directoryId",
        {
          replacements: { directoryId: bankStatementDir.id },
          type: queryInterface.sequelize.QueryTypes.DELETE
        }
      );

      // Restore original fields (simplified version)
      const now = new Date();
      const originalFields = [
        {
          id: uuidv4(),
          directory_id: bankStatementDir.id,
          name: 'statement_number',
          type: 'text',
          relation_id: null,
          created_at: now,
          updated_at: now,
          metadata: {
            isVisibleOnTable: true,
            fieldOrder: 1,
            isEditable: true,
            isFilterable: true
          }
        },
        {
          id: uuidv4(),
          directory_id: bankStatementDir.id,
          name: 'period_start',
          type: 'date',
          relation_id: null,
          created_at: now,
          updated_at: now,
          metadata: {
            isVisibleOnTable: true,
            fieldOrder: 2,
            isEditable: true,
            isFilterable: true
          }
        },
        {
          id: uuidv4(),
          directory_id: bankStatementDir.id,
          name: 'period_end',
          type: 'date',
          relation_id: null,
          created_at: now,
          updated_at: now,
          metadata: {
            isVisibleOnTable: true,
            fieldOrder: 3,
            isEditable: true,
            isFilterable: true
          }
        }
      ];

      await queryInterface.bulkInsert('directory_fields', originalFields);
    }
  }
}; 