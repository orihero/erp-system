'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Clean up existing directory data in the correct order
    await queryInterface.bulkDelete('directory_values', null, {});
    await queryInterface.bulkDelete('directory_records', null, {});
    await queryInterface.bulkDelete('directory_fields', null, {});
    await queryInterface.bulkDelete('company_directories', null, {});
    await queryInterface.bulkDelete('directories', null, {});
    const now = new Date();

    // Predefine UUIDs for new directories
    const receiptsDirId = uuidv4();
    const terminalDirId = uuidv4();
    const bankStatementDirId = uuidv4();
    const measurementsDirId = uuidv4();
    const currencyDirId = uuidv4();
    const taxCodesDirId = uuidv4();
    const unitsDirId = uuidv4();

    // Create Directories
    await queryInterface.bulkInsert('directories', [
      {
        id: uuidv4(),
        name: 'Clients',
        icon_name: 'material-symbols:business',
        directory_type: 'Company',
        created_at: now,
        updated_at: now,
        metadata: null
      },
      {
        id: uuidv4(),
        name: 'Contracts',
        icon_name: 'material-symbols:description',
        directory_type: 'Company',
        created_at: now,
        updated_at: now,
        metadata: null
      },
      {
        id: uuidv4(),
        name: 'Cars',
        icon_name: 'material-symbols:directions-car',
        directory_type: 'Company',
        created_at: now,
        updated_at: now,
        metadata: null
      },
      {
        id: uuidv4(),
        name: 'Employees',
        icon_name: 'material-symbols:people',
        directory_type: 'Company',
        created_at: now,
        updated_at: now,
        metadata: null
      },
      {
        id: receiptsDirId,
        name: 'Receipts',
        icon_name: 'material-symbols:receipt',
        directory_type: 'Module',
        created_at: now,
        updated_at: now,
        metadata: null
      },
      {
        id: terminalDirId,
        name: 'Terminal',
        icon_name: 'material-symbols:point-of-sale',
        directory_type: 'Module',
        created_at: now,
        updated_at: now,
        metadata: null
      },
      {
        id: bankStatementDirId,
        name: 'Bank Statement',
        icon_name: 'material-symbols:account-balance',
        directory_type: 'Module',
        created_at: now,
        updated_at: now,
        metadata: JSON.stringify({
          componentName: 'BankStatement',
          groupBy: 'fileName',
          sheetName: 'Sheet1',
          horizontalOffset: 0,
          verticalOffset: 0
        })
      },
      {
        id: measurementsDirId,
        name: 'Measurements',
        icon_name: 'material-symbols:straighten',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: null
      },
      {
        id: currencyDirId,
        name: 'Currency',
        icon_name: 'material-symbols:attach-money',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: null
      },
      {
        id: taxCodesDirId,
        name: 'Tax Codes',
        icon_name: 'material-symbols:percent',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: null
      },
      {
        id: unitsDirId,
        name: 'Units',
        icon_name: 'material-symbols:square-foot',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: null
      }
    ]);

    // Fetch actual directory IDs from the database after insertion
    const directories = await queryInterface.sequelize.query(
      'SELECT * FROM directories ORDER BY created_at ASC;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const clientsDir = directories.find(d => d.name === 'Clients');
    const contractsDir = directories.find(d => d.name === 'Contracts');
    const carsDir = directories.find(d => d.name === 'Cars');
    const employeesDir = directories.find(d => d.name === 'Employees');
    const receiptsDir = directories.find(d => d.name === 'Receipts');
    const terminalDir = directories.find(d => d.name === 'Terminal');
    const bankStatementDir = directories.find(d => d.name === 'Bank Statement');

    // Create Directory Fields
    const directoryFields = [
      // Clients fields
      {
        id: uuidv4(),
        directory_id: clientsDir.id,
        name: 'name',
        type: 'text',
        required: true,
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
        directory_id: clientsDir.id,
        name: 'contact_person',
        type: 'text',
        required: false,
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
        directory_id: clientsDir.id,
        name: 'address',
        type: 'textarea',
        required: false,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 3,
          isEditable: true,
          isFilterable: false
        }
      },
      {
        id: uuidv4(),
        directory_id: clientsDir.id,
        name: 'contracts',
        type: 'relation',
        relation_id: contractsDir.id,
        required: false,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: false,
          fieldOrder: 4,
          isEditable: false,
          isFilterable: false
        }
      },

      // Contracts fields
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'name',
        type: 'text',
        required: true,
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
        directory_id: contractsDir.id,
        name: 'content',
        type: 'textarea',
        required: true,
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
        directory_id: contractsDir.id,
        name: 'start_date',
        type: 'date',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 3,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'end_date',
        type: 'date',
        required: false,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 4,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'client',
        type: 'relation',
        relation_id: clientsDir.id,
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: false,
          fieldOrder: 5,
          isEditable: false,
          isFilterable: false
        }
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'amount',
        type: 'number',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 5,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'requisites',
        type: 'json',
        required: false,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: false,
          fieldOrder: 6,
          isEditable: false,
          isFilterable: false
        }
      },

      // Cars fields
      {
        id: uuidv4(),
        directory_id: carsDir.id,
        name: 'name',
        type: 'text',
        required: true,
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
        directory_id: carsDir.id,
        name: 'driver',
        type: 'relation',
        relation_id: employeesDir.id,
        required: false,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: false,
          fieldOrder: 2,
          isEditable: false,
          isFilterable: false
        }
      },

      // Employees fields
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'firstname',
        type: 'text',
        required: true,
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
        directory_id: employeesDir.id,
        name: 'lastname',
        type: 'text',
        required: true,
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
        directory_id: employeesDir.id,
        name: 'email',
        type: 'email',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 3,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'phone',
        type: 'tel',
        required: false,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 4,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'position',
        type: 'text',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 5,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'department',
        type: 'text',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 6,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'hire_date',
        type: 'date',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 7,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'salary',
        type: 'number',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 8,
          isEditable: true,
          isFilterable: true
        }
      },

      // Receipts fields
      {
        id: uuidv4(),
        directory_id: receiptsDir.id,
        name: 'receipt_number',
        type: 'text',
        required: true,
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
        directory_id: receiptsDir.id,
        name: 'date',
        type: 'date',
        required: true,
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
        directory_id: receiptsDir.id,
        name: 'customer_name',
        type: 'text',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 3,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: receiptsDir.id,
        name: 'total_amount',
        type: 'number',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 4,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: receiptsDir.id,
        name: 'payment_method',
        type: 'select',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 5,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: receiptsDir.id,
        name: 'cashier',
        type: 'text',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 6,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: receiptsDir.id,
        name: 'items',
        type: 'json',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: false,
          fieldOrder: 7,
          isEditable: false,
          isFilterable: false
        }
      },

      // Bank Statement fields
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'statement_number',
        type: 'text',
        required: true,
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
        required: true,
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
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 3,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'account_number',
        type: 'text',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 4,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'bank_name',
        type: 'text',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 5,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'opening_balance',
        type: 'number',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 6,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'closing_balance',
        type: 'number',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 7,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: bankStatementDir.id,
        name: 'transactions',
        type: 'json',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: false,
          fieldOrder: 8,
          isEditable: false,
          isFilterable: false
        }
      },

      // Terminal fields
      {
        id: uuidv4(),
        directory_id: terminalDir.id,
        name: 'terminal_id',
        type: 'text',
        required: true,
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
        directory_id: terminalDir.id,
        name: 'location',
        type: 'text',
        required: true,
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
        directory_id: terminalDir.id,
        name: 'model',
        type: 'text',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 3,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: terminalDir.id,
        name: 'serial_number',
        type: 'text',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 4,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: terminalDir.id,
        name: 'status',
        type: 'select',
        required: true,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 5,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: terminalDir.id,
        name: 'last_service_date',
        type: 'date',
        required: false,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 6,
          isEditable: true,
          isFilterable: true
        }
      },
      {
        id: uuidv4(),
        directory_id: terminalDir.id,
        name: 'assigned_employee',
        type: 'text',
        required: false,
        created_at: now,
        updated_at: now,
        metadata: {
          isVisibleOnTable: true,
          fieldOrder: 7,
          isEditable: true,
          isFilterable: true
        }
      }
    ];
    // Stringify metadata for each field
    directoryFields.forEach(field => {
      if (field.metadata) {
        field.metadata = JSON.stringify(field.metadata);
      }
    });
    await queryInterface.bulkInsert('directory_fields', directoryFields);

    // Get the created fields
    const fields = await queryInterface.sequelize.query(
      'SELECT * FROM directory_fields ORDER BY created_at ASC;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Get a company ID (assuming there's at least one company)
    const companies = await queryInterface.sequelize.query(
      'SELECT id FROM companies LIMIT 1;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (companies.length === 0) {
      throw new Error('No companies found. Please create a company first.');
    }

    const companyId = companies[0].id;

    // Get a company_module_id for the company (use the first available module for demo)
    let companyModules = await queryInterface.sequelize.query(
      'SELECT id FROM company_modules WHERE company_id = :companyId LIMIT 1;',
      {
        replacements: { companyId },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );
    let companyModuleId;
    if (companyModules.length === 0) {
      // No company_modules exist, create one using the first available module
      const modules = await queryInterface.sequelize.query(
        'SELECT id FROM modules LIMIT 1;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      if (modules.length === 0) {
        throw new Error('No modules found. Please create a module first.');
      }
      const moduleId = modules[0].id;
      const newCompanyModuleId = uuidv4();
      await queryInterface.bulkInsert('company_modules', [{
        id: newCompanyModuleId,
        company_id: companyId,
        module_id: moduleId,
        created_at: now,
        updated_at: now
      }]);
      companyModuleId = newCompanyModuleId;
    } else {
      companyModuleId = companyModules[0].id;
    }

    // Create Company Directories
    const companyDirectories = await queryInterface.bulkInsert('company_directories', [
      {
        id: uuidv4(),
        company_id: companyId,
        directory_id: clientsDir.id,
        module_id: companyModuleId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_id: companyId,
        directory_id: contractsDir.id,
        module_id: companyModuleId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_id: companyId,
        directory_id: carsDir.id,
        module_id: companyModuleId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_id: companyId,
        directory_id: employeesDir.id,
        module_id: companyModuleId,
        created_at: now,
        updated_at: now
      }
    ], { returning: true });

    // Get the created company directories
    const companyDirs = await queryInterface.sequelize.query(
      'SELECT * FROM company_directories ORDER BY created_at ASC;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Create demo records for each company directory
    const clientDir = companyDirs.find(d => d.directory_id === clientsDir.id);
    const contractDir = companyDirs.find(d => d.directory_id === contractsDir.id);
    const carDir = companyDirs.find(d => d.directory_id === carsDir.id);
    const employeeDir = companyDirs.find(d => d.directory_id === employeesDir.id);

    // Create Directory Records for each Company Directory
    await queryInterface.bulkInsert('directory_records', [
      {
        id: uuidv4(),
        company_directory_id: clientDir.id,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: contractDir.id,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: carDir.id,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: employeeDir.id,
        created_at: now,
        updated_at: now
      }
    ]);

    // Get the created directory records
    const directoryRecords = await queryInterface.sequelize.query(
      'SELECT * FROM directory_records ORDER BY created_at ASC;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const clientRecord = directoryRecords.find(r => r.company_directory_id === clientDir.id);
    const contractRecord = directoryRecords.find(r => r.company_directory_id === contractDir.id);
    const carRecord = directoryRecords.find(r => r.company_directory_id === carDir.id);
    const employeeRecord = directoryRecords.find(r => r.company_directory_id === employeeDir.id);

    // Get field IDs
    const clientFields = fields.filter(f => f.directory_id === clientsDir.id);
    const contractFields = fields.filter(f => f.directory_id === contractsDir.id);
    const carFields = fields.filter(f => f.directory_id === carsDir.id);
    const employeeFields = fields.filter(f => f.directory_id === employeesDir.id);

    // Create demo values linked to Directory Records
    await queryInterface.bulkInsert('directory_values', [
      // Client values
      {
        id: uuidv4(),
        directory_record_id: clientRecord.id,
        field_id: clientFields.find(f => f.name === 'name').id,
        value: 'UzAuto Motors',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: clientRecord.id,
        field_id: clientFields.find(f => f.name === 'contact_person').id,
        value: 'John Doe',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: clientRecord.id,
        field_id: clientFields.find(f => f.name === 'address').id,
        value: 'Tashkent, Uzbekistan',
        created_at: now,
        updated_at: now
      },

      // Contract values
      {
        id: uuidv4(),
        directory_record_id: contractRecord.id,
        field_id: contractFields.find(f => f.name === 'name').id,
        value: 'Supply Contract 2024',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: contractRecord.id,
        field_id: contractFields.find(f => f.name === 'content').id,
        value: 'Annual supply contract for automotive parts',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: contractRecord.id,
        field_id: contractFields.find(f => f.name === 'start_date').id,
        value: '2024-01-01',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: contractRecord.id,
        field_id: contractFields.find(f => f.name === 'end_date').id,
        value: '2024-12-31',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: contractRecord.id,
        field_id: contractFields.find(f => f.name === 'amount').id,
        value: '1000000.00',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: contractRecord.id,
        field_id: contractFields.find(f => f.name === 'requisites').id,
        value: JSON.stringify({
          bank: 'NBU',
          account: '20208000900000000001',
          mfo: '00001'
        }),
        created_at: now,
        updated_at: now
      },

      // Car values
      {
        id: uuidv4(),
        directory_record_id: carRecord.id,
        field_id: carFields.find(f => f.name === 'name').id,
        value: 'Chevrolet Cobalt 01A123AA',
        created_at: now,
        updated_at: now
      },

      // Employee values
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'firstname').id,
        value: 'Aziz',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'lastname').id,
        value: 'Karimov',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'email').id,
        value: 'aziz.karimov@uzauto.com',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'phone').id,
        value: '+998901234567',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'position').id,
        value: 'Driver',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'department').id,
        value: 'Transport',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'hire_date').id,
        value: '2024-01-01',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'salary').id,
        value: '5000000.00',
        created_at: now,
        updated_at: now
      }
    ]);

    // Get field IDs for new directories
    const receiptsFields = fields.filter(f => f.directory_id === receiptsDir.id);
    const bankStatementFields = fields.filter(f => f.directory_id === bankStatementDir.id);
    const terminalFields = fields.filter(f => f.directory_id === terminalDir.id);

    // Create Company Directories for new directories
    const receiptsCompanyDir = await queryInterface.bulkInsert('company_directories', [{
      id: uuidv4(),
      company_id: companyId,
      directory_id: receiptsDir.id,
      module_id: companyModuleId,
      created_at: now,
      updated_at: now
    }], { returning: true });
    const terminalCompanyDir = await queryInterface.bulkInsert('company_directories', [{
      id: uuidv4(),
      company_id: companyId,
      directory_id: terminalDir.id,
      module_id: companyModuleId,
      created_at: now,
      updated_at: now
    }], { returning: true });
    const bankStatementCompanyDir = await queryInterface.bulkInsert('company_directories', [{
      id: uuidv4(),
      company_id: companyId,
      directory_id: bankStatementDir.id,
      module_id: companyModuleId,
      created_at: now,
      updated_at: now
    }], { returning: true });

    // Create Directory Records for new directories
    const receiptsRecordId = uuidv4();
    const terminalRecordId = uuidv4();
    const bankStatementRecordId = uuidv4();
    await queryInterface.bulkInsert('directory_records', [
      {
        id: receiptsRecordId,
        company_directory_id: receiptsCompanyDir[0]?.id || receiptsCompanyDir,
        created_at: now,
        updated_at: now
      },
      {
        id: terminalRecordId,
        company_directory_id: terminalCompanyDir[0]?.id || terminalCompanyDir,
        created_at: now,
        updated_at: now
      },
      {
        id: bankStatementRecordId,
        company_directory_id: bankStatementCompanyDir[0]?.id || bankStatementCompanyDir,
        created_at: now,
        updated_at: now
      }
    ]);

    // Create demo values for Receipts
    await queryInterface.bulkInsert('directory_values', [
      // Receipts
      {
        id: uuidv4(),
        directory_record_id: receiptsRecordId,
        field_id: receiptsFields.find(f => f.name === 'receipt_number')?.id,
        value: 'RCP-2024-0001',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: receiptsRecordId,
        field_id: receiptsFields.find(f => f.name === 'date')?.id,
        value: '2024-06-13',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: receiptsRecordId,
        field_id: receiptsFields.find(f => f.name === 'customer_name')?.id,
        value: 'Jane Smith',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: receiptsRecordId,
        field_id: receiptsFields.find(f => f.name === 'total_amount')?.id,
        value: '250000',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: receiptsRecordId,
        field_id: receiptsFields.find(f => f.name === 'payment_method')?.id,
        value: 'card',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: receiptsRecordId,
        field_id: receiptsFields.find(f => f.name === 'cashier')?.id,
        value: 'Ali Valiyev',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: receiptsRecordId,
        field_id: receiptsFields.find(f => f.name === 'items')?.id,
        value: JSON.stringify([
          { name: 'Product A', qty: 2, price: 50000 },
          { name: 'Product B', qty: 1, price: 150000 }
        ]),
        created_at: now,
        updated_at: now
      },
      // Bank Statement
      {
        id: uuidv4(),
        directory_record_id: bankStatementRecordId,
        field_id: bankStatementFields.find(f => f.name === 'statement_number')?.id,
        value: 'BS-2024-06',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: bankStatementRecordId,
        field_id: bankStatementFields.find(f => f.name === 'period_start')?.id,
        value: '2024-06-01',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: bankStatementRecordId,
        field_id: bankStatementFields.find(f => f.name === 'period_end')?.id,
        value: '2024-06-13',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: bankStatementRecordId,
        field_id: bankStatementFields.find(f => f.name === 'account_number')?.id,
        value: '20208000900000000001',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: bankStatementRecordId,
        field_id: bankStatementFields.find(f => f.name === 'bank_name')?.id,
        value: 'NBU',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: bankStatementRecordId,
        field_id: bankStatementFields.find(f => f.name === 'opening_balance')?.id,
        value: '1000000',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: bankStatementRecordId,
        field_id: bankStatementFields.find(f => f.name === 'closing_balance')?.id,
        value: '1250000',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: bankStatementRecordId,
        field_id: bankStatementFields.find(f => f.name === 'transactions')?.id,
        value: JSON.stringify([
          { date: '2024-06-02', type: 'credit', amount: 250000, description: 'Payment received' },
          { date: '2024-06-10', type: 'debit', amount: 100000, description: 'Supplier payment' }
        ]),
        created_at: now,
        updated_at: now
      },
      // Terminal
      {
        id: uuidv4(),
        directory_record_id: terminalRecordId,
        field_id: terminalFields.find(f => f.name === 'terminal_id')?.id,
        value: 'T-001',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: terminalRecordId,
        field_id: terminalFields.find(f => f.name === 'location')?.id,
        value: 'Main Hall',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: terminalRecordId,
        field_id: terminalFields.find(f => f.name === 'model')?.id,
        value: 'Ingenico iWL250',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: terminalRecordId,
        field_id: terminalFields.find(f => f.name === 'serial_number')?.id,
        value: 'SN123456789',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: terminalRecordId,
        field_id: terminalFields.find(f => f.name === 'status')?.id,
        value: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: terminalRecordId,
        field_id: terminalFields.find(f => f.name === 'last_service_date')?.id,
        value: '2024-05-20',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: terminalRecordId,
        field_id: terminalFields.find(f => f.name === 'assigned_employee')?.id,
        value: 'Aziz Karimov',
        created_at: now,
        updated_at: now
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Delete in reverse order to handle foreign key constraints
    await queryInterface.bulkDelete('directory_values', null, {});
    await queryInterface.bulkDelete('directory_records', null, {});
    await queryInterface.bulkDelete('directory_fields', null, {});
    await queryInterface.bulkDelete('company_directories', null, {});
    await queryInterface.bulkDelete('directories', null, {});
  }
};
