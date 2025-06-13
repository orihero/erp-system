'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Create Directories
    await queryInterface.bulkInsert('directories', [
      {
        id: uuidv4(),
        name: 'Clients',
        icon_name: 'material-symbols:business',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        name: 'Contracts',
        icon_name: 'material-symbols:description',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        name: 'Cars',
        icon_name: 'material-symbols:directions-car',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        name: 'Employees',
        icon_name: 'material-symbols:people',
        created_at: now,
        updated_at: now
      }
    ]);

    // Get the created directories
    const directories = await queryInterface.sequelize.query(
      'SELECT * FROM directories ORDER BY created_at ASC;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const clientsDir = directories.find(d => d.name === 'Clients');
    const contractsDir = directories.find(d => d.name === 'Contracts');
    const carsDir = directories.find(d => d.name === 'Cars');
    const employeesDir = directories.find(d => d.name === 'Employees');

    // Create Directory Fields
    await queryInterface.bulkInsert('directory_fields', [
      // Clients fields
      {
        id: uuidv4(),
        directory_id: clientsDir.id,
        name: 'name',
        type: 'string',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: clientsDir.id,
        name: 'contact_person',
        type: 'string',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: clientsDir.id,
        name: 'address',
        type: 'string',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: clientsDir.id,
        name: 'contracts',
        type: 'relation',
        relation_id: contractsDir.id,
        created_at: now,
        updated_at: now
      },

      // Contracts fields
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'name',
        type: 'string',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'content',
        type: 'text',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'start_date',
        type: 'date',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'end_date',
        type: 'date',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'client',
        type: 'relation',
        relation_id: clientsDir.id,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'amount',
        type: 'decimal',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: contractsDir.id,
        name: 'requisites',
        type: 'json',
        created_at: now,
        updated_at: now
      },

      // Cars fields
      {
        id: uuidv4(),
        directory_id: carsDir.id,
        name: 'name',
        type: 'string',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: carsDir.id,
        name: 'driver',
        type: 'relation',
        relation_id: employeesDir.id,
        created_at: now,
        updated_at: now
      },

      // Employees fields
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'firstname',
        type: 'string',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'lastname',
        type: 'string',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'phone',
        type: 'string',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'address',
        type: 'string',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'salary',
        type: 'decimal',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'contract',
        type: 'relation',
        relation_id: contractsDir.id,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_id: employeesDir.id,
        name: 'role',
        type: 'string',
        created_at: now,
        updated_at: now
      }
    ]);

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
        field_id: employeeFields.find(f => f.name === 'phone').id,
        value: '+998901234567',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'address').id,
        value: 'Tashkent, Yunusabad',
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
      },
      {
        id: uuidv4(),
        directory_record_id: employeeRecord.id,
        field_id: employeeFields.find(f => f.name === 'role').id,
        value: 'Driver',
        created_at: now,
        updated_at: now
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Delete in reverse order to handle foreign key constraints
    await queryInterface.bulkDelete('directory_values', null, {});
    await queryInterface.bulkDelete('company_directories', null, {});
    await queryInterface.bulkDelete('directory_fields', null, {});
    await queryInterface.bulkDelete('directories', null, {});
  }
};
