'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Get the Bank Statement directory and company directory
    const [bankStatementDir] = await queryInterface.sequelize.query(
      "SELECT id FROM directories WHERE name = 'Bank Statement' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!bankStatementDir) {
      console.log('Bank Statement directory not found, skipping bank statement records seeder');
      return;
    }

    // Get a company directory for bank statement
    const [companyDirectory] = await queryInterface.sequelize.query(
      "SELECT id FROM company_directories WHERE directory_id = :directoryId LIMIT 1;",
      { 
        replacements: { directoryId: bankStatementDir.id },
        type: queryInterface.sequelize.QueryTypes.SELECT 
      }
    );

    if (!companyDirectory) {
      console.log('Company directory for Bank Statement not found, skipping bank statement records seeder');
      return;
    }

    // Get bank statement fields
    const fields = await queryInterface.sequelize.query(
      "SELECT id, name FROM directory_fields WHERE directory_id = :directoryId ORDER BY (metadata->>'fieldOrder')::int;",
      { 
        replacements: { directoryId: bankStatementDir.id },
        type: queryInterface.sequelize.QueryTypes.SELECT 
      }
    );

    const fieldMap = {};
    fields.forEach(field => {
      fieldMap[field.name] = field.id;
    });

    // Sample bank statement records
    const sampleRecords = [
      {
        fileName: 'bank_statement_2024_01.xlsx',
        documentDate: '2024-01-15',
        account: '20214000800000000001',
        organizationName: 'ABC Company LLC',
        documentNumber: 1001,
        documentType: 1,
        branch: 1,
        debitTurnover: 0,
        creditTurnover: 5000000,
        paymentPurpose: 'Payment for services rendered',
        taxId: '123456789'
      },
      {
        fileName: 'bank_statement_2024_01.xlsx',
        documentDate: '2024-01-16',
        account: '20214000800000000001',
        organizationName: 'XYZ Corporation',
        documentNumber: 1002,
        documentType: 2,
        branch: 1,
        debitTurnover: 2500000,
        creditTurnover: 0,
        paymentPurpose: 'Equipment purchase',
        taxId: '987654321'
      },
      {
        fileName: 'bank_statement_2024_02.xlsx',
        documentDate: '2024-02-01',
        account: '20214000800000000002',
        organizationName: 'DEF Industries',
        documentNumber: 2001,
        documentType: 1,
        branch: 2,
        debitTurnover: 0,
        creditTurnover: 3000000,
        paymentPurpose: 'Monthly service payment',
        taxId: '456789123'
      },
      {
        fileName: 'bank_statement_2024_02.xlsx',
        documentDate: '2024-02-02',
        account: '20214000800000000002',
        organizationName: 'GHI Trading Co',
        documentNumber: 2002,
        documentType: 2,
        branch: 2,
        debitTurnover: 1500000,
        creditTurnover: 0,
        paymentPurpose: 'Raw materials purchase',
        taxId: '789123456'
      }
    ];

    // Create directory records and values
    for (const record of sampleRecords) {
      const recordId = uuidv4();
      
      // Create directory record
      await queryInterface.bulkInsert('directory_records', [{
        id: recordId,
        company_directory_id: companyDirectory.id,
        created_at: now,
        updated_at: now
      }]);

      // Create directory values
      const values = [];
      for (const [fieldName, value] of Object.entries(record)) {
        if (fieldMap[fieldName]) {
          values.push({
            id: uuidv4(),
            directory_record_id: recordId,
            field_id: fieldMap[fieldName],
            value: value,
            created_at: now,
            updated_at: now
          });
        }
      }

      if (values.length > 0) {
        await queryInterface.bulkInsert('directory_values', values);
      }
    }

    console.log('Bank statement records created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Get the Bank Statement directory
    const [bankStatementDir] = await queryInterface.sequelize.query(
      "SELECT id FROM directories WHERE name = 'Bank Statement' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (bankStatementDir) {
      // Get company directory
      const [companyDirectory] = await queryInterface.sequelize.query(
        "SELECT id FROM company_directories WHERE directory_id = :directoryId LIMIT 1;",
        { 
          replacements: { directoryId: bankStatementDir.id },
          type: queryInterface.sequelize.QueryTypes.SELECT 
        }
      );

      if (companyDirectory) {
        // Delete directory records and their values
        await queryInterface.sequelize.query(
          "DELETE FROM directory_values WHERE directory_record_id IN (SELECT id FROM directory_records WHERE company_directory_id = :companyDirectoryId);",
          { replacements: { companyDirectoryId: companyDirectory.id } }
        );

        await queryInterface.sequelize.query(
          "DELETE FROM directory_records WHERE company_directory_id = :companyDirectoryId;",
          { replacements: { companyDirectoryId: companyDirectory.id } }
        );
      }
    }
  }
}; 