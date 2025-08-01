'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // First, create the missing directories if they don't exist
    const existingDirectories = await queryInterface.sequelize.query(
      'SELECT * FROM directories WHERE name IN (\'Payment Types\', \'Inventory\', \'Raw Materials\', \'Departments\');',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    let paymentTypesDirId, inventoryDirId, rawMaterialsDirId, departmentsDirId;

    // Find or create Payment Types directory
    let paymentTypesDir = existingDirectories.find(d => d.name === 'Payment Types');
    if (!paymentTypesDir) {
      paymentTypesDirId = uuidv4();
      await queryInterface.bulkInsert('directories', [{
        id: paymentTypesDirId,
        name: 'Payment Types',
        icon_name: 'material-symbols:payment',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: null
      }]);
    } else {
      paymentTypesDirId = paymentTypesDir.id;
    }

    // Find or create Inventory directory
    let inventoryDir = existingDirectories.find(d => d.name === 'Inventory');
    if (!inventoryDir) {
      inventoryDirId = uuidv4();
      await queryInterface.bulkInsert('directories', [{
        id: inventoryDirId,
        name: 'Inventory',
        icon_name: 'material-symbols:inventory',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: null
      }]);
    } else {
      inventoryDirId = inventoryDir.id;
    }

    // Find or create Raw Materials directory
    let rawMaterialsDir = existingDirectories.find(d => d.name === 'Raw Materials');
    if (!rawMaterialsDir) {
      rawMaterialsDirId = uuidv4();
      await queryInterface.bulkInsert('directories', [{
        id: rawMaterialsDirId,
        name: 'Raw Materials',
        icon_name: 'material-symbols:construction',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: null
      }]);
    } else {
      rawMaterialsDirId = rawMaterialsDir.id;
    }

    // Find or create Departments directory
    let departmentsDir = existingDirectories.find(d => d.name === 'Departments');
    if (!departmentsDir) {
      departmentsDirId = uuidv4();
      await queryInterface.bulkInsert('directories', [{
        id: departmentsDirId,
        name: 'Departments',
        icon_name: 'material-symbols:business',
        directory_type: 'System',
        created_at: now,
        updated_at: now,
        metadata: null
      }]);
    } else {
      departmentsDirId = departmentsDir.id;
    }

    // Get the existing Employees directory
    const employeesDir = await queryInterface.sequelize.query(
      'SELECT * FROM directories WHERE name = \'Employees\';',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const employeesDirId = employeesDir[0]?.id;

    if (!employeesDirId) {
      console.log('Employees directory not found, skipping cascading data seeding');
      return;
    }

    // Get or create company directories for these directories
    const companies = await queryInterface.sequelize.query(
      'SELECT * FROM companies LIMIT 1;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (companies.length === 0) {
      console.log('No companies found, skipping cascading data seeding');
      return;
    }

    const companyId = companies[0].id;

    // Get or create company directories
    const existingCompanyDirs = await queryInterface.sequelize.query(
      'SELECT * FROM company_directories WHERE company_id = ? AND directory_id IN (?, ?, ?, ?, ?);',
      { 
        replacements: [companyId, paymentTypesDirId, inventoryDirId, rawMaterialsDirId, departmentsDirId, employeesDirId],
        type: queryInterface.sequelize.QueryTypes.SELECT 
      }
    );

    let paymentTypesCompanyDirId, inventoryCompanyDirId, rawMaterialsCompanyDirId, departmentsCompanyDirId, employeesCompanyDirId;

    // Create company directories if they don't exist
    const companyDirectories = [];
    
    if (!existingCompanyDirs.find(d => d.directory_id === paymentTypesDirId)) {
      paymentTypesCompanyDirId = uuidv4();
      companyDirectories.push({
        id: paymentTypesCompanyDirId,
        company_id: companyId,
        directory_id: paymentTypesDirId,
        created_at: now,
        updated_at: now
      });
    } else {
      paymentTypesCompanyDirId = existingCompanyDirs.find(d => d.directory_id === paymentTypesDirId).id;
    }

    if (!existingCompanyDirs.find(d => d.directory_id === inventoryDirId)) {
      inventoryCompanyDirId = uuidv4();
      companyDirectories.push({
        id: inventoryCompanyDirId,
        company_id: companyId,
        directory_id: inventoryDirId,
        created_at: now,
        updated_at: now
      });
    } else {
      inventoryCompanyDirId = existingCompanyDirs.find(d => d.directory_id === inventoryDirId).id;
    }

    if (!existingCompanyDirs.find(d => d.directory_id === rawMaterialsDirId)) {
      rawMaterialsCompanyDirId = uuidv4();
      companyDirectories.push({
        id: rawMaterialsCompanyDirId,
        company_id: companyId,
        directory_id: rawMaterialsDirId,
        created_at: now,
        updated_at: now
      });
    } else {
      rawMaterialsCompanyDirId = existingCompanyDirs.find(d => d.directory_id === rawMaterialsDirId).id;
    }

    if (!existingCompanyDirs.find(d => d.directory_id === departmentsDirId)) {
      departmentsCompanyDirId = uuidv4();
      companyDirectories.push({
        id: departmentsCompanyDirId,
        company_id: companyId,
        directory_id: departmentsDirId,
        created_at: now,
        updated_at: now
      });
    } else {
      departmentsCompanyDirId = existingCompanyDirs.find(d => d.directory_id === departmentsDirId).id;
    }

    if (!existingCompanyDirs.find(d => d.directory_id === employeesDirId)) {
      employeesCompanyDirId = uuidv4();
      companyDirectories.push({
        id: employeesCompanyDirId,
        company_id: companyId,
        directory_id: employeesDirId,
        created_at: now,
        updated_at: now
      });
    } else {
      employeesCompanyDirId = existingCompanyDirs.find(d => d.directory_id === employeesDirId).id;
    }

    if (companyDirectories.length > 0) {
      await queryInterface.bulkInsert('company_directories', companyDirectories);
    }

    // Get or create directory fields
    const existingFields = await queryInterface.sequelize.query(
      'SELECT * FROM directory_fields WHERE directory_id IN (?, ?, ?, ?, ?);',
      { 
        replacements: [paymentTypesDirId, inventoryDirId, rawMaterialsDirId, departmentsDirId, employeesDirId],
        type: queryInterface.sequelize.QueryTypes.SELECT 
      }
    );

    const fieldIds = {};

    // Create fields for Payment Types directory
    let paymentTypesField = existingFields.find(f => f.directory_id === paymentTypesDirId && f.name === 'Payment Type');
    if (!paymentTypesField) {
      fieldIds.paymentTypes = uuidv4();
      await queryInterface.bulkInsert('directory_fields', [{
        id: fieldIds.paymentTypes,
        directory_id: paymentTypesDirId,
        name: 'Payment Type',
        type: 'select',
        required: true,
        created_at: now,
        updated_at: now
      }]);
    } else {
      fieldIds.paymentTypes = paymentTypesField.id;
    }

    // Create fields for Inventory directory
    let inventoryField = existingFields.find(f => f.directory_id === inventoryDirId && f.name === 'Inventory Item');
    if (!inventoryField) {
      fieldIds.inventory = uuidv4();
      await queryInterface.bulkInsert('directory_fields', [{
        id: fieldIds.inventory,
        directory_id: inventoryDirId,
        name: 'Inventory Item',
        type: 'select',
        required: true,
        created_at: now,
        updated_at: now
      }]);
    } else {
      fieldIds.inventory = inventoryField.id;
    }

    // Create fields for Raw Materials directory
    let rawMaterialsField = existingFields.find(f => f.directory_id === rawMaterialsDirId && f.name === 'Raw Material');
    if (!rawMaterialsField) {
      fieldIds.rawMaterials = uuidv4();
      await queryInterface.bulkInsert('directory_fields', [{
        id: fieldIds.rawMaterials,
        directory_id: rawMaterialsDirId,
        name: 'Raw Material',
        type: 'select',
        required: true,
        created_at: now,
        updated_at: now
      }]);
    } else {
      fieldIds.rawMaterials = rawMaterialsField.id;
    }

    // Create fields for Departments directory
    let departmentsField = existingFields.find(f => f.directory_id === departmentsDirId && f.name === 'Department');
    if (!departmentsField) {
      fieldIds.departments = uuidv4();
      await queryInterface.bulkInsert('directory_fields', [{
        id: fieldIds.departments,
        directory_id: departmentsDirId,
        name: 'Department',
        type: 'select',
        required: true,
        created_at: now,
        updated_at: now
      }]);
    } else {
      fieldIds.departments = departmentsField.id;
    }

    // Create fields for Employees directory
    let employeesField = existingFields.find(f => f.directory_id === employeesDirId && f.name === 'Employee');
    if (!employeesField) {
      fieldIds.employees = uuidv4();
      await queryInterface.bulkInsert('directory_fields', [{
        id: fieldIds.employees,
        directory_id: employeesDirId,
        name: 'Employee',
        type: 'select',
        required: true,
        created_at: now,
        updated_at: now
      }]);
    } else {
      fieldIds.employees = employeesField.id;
    }

    // Create directory records with metadata for cascading configuration
    const directoryRecords = [
      // Payment Types with cascading configuration in metadata
      {
        id: uuidv4(),
        company_directory_id: paymentTypesCompanyDirId,
        metadata: JSON.stringify({
          value: 'delivery_of_services',
          name: 'Delivery of Services',
          cascadingConfig: {
            enabled: false
          }
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: paymentTypesCompanyDirId,
        metadata: JSON.stringify({
          value: 'buying_raw_material',
          name: 'Buying Raw Material',
          cascadingConfig: {
            enabled: true,
            dependentFields: [
              {
                fieldName: 'inventory',
                directoryId: inventoryDirId,
                displayName: 'Select Inventory',
                required: true,
                dependsOn: null
              },
              {
                fieldName: 'raw_material',
                directoryId: rawMaterialsDirId,
                displayName: 'Select Raw Material',
                required: true,
                dependsOn: 'inventory'
              }
            ]
          }
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: paymentTypesCompanyDirId,
        metadata: JSON.stringify({
          value: 'employee_salary',
          name: 'Employee Salary',
          cascadingConfig: {
            enabled: true,
            dependentFields: [
              {
                fieldName: 'department',
                directoryId: departmentsDirId,
                displayName: 'Select Department',
                required: true,
                dependsOn: null
              },
              {
                fieldName: 'employee',
                directoryId: employeesDirId,
                displayName: 'Select Employee',
                required: true,
                dependsOn: 'department'
              }
            ]
          }
        }),
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('directory_records', directoryRecords);

    // Now insert directory values without metadata (metadata is now in DirectoryRecord)
    const directoryValues = [
      // Payment Types
      {
        id: uuidv4(),
        directory_record_id: directoryRecords[0].id,
        field_id: fieldIds.paymentTypes,
        value: 'delivery_of_services',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: directoryRecords[1].id,
        field_id: fieldIds.paymentTypes,
        value: 'buying_raw_material',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: directoryRecords[2].id,
        field_id: fieldIds.paymentTypes,
        value: 'employee_salary',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('directory_values', directoryValues);

    // Create additional directory records for cascading options
    const additionalRecords = [
      // Inventory Items
      {
        id: uuidv4(),
        company_directory_id: inventoryCompanyDirId,
        metadata: JSON.stringify({
          value: 'electronics',
          name: 'Electronics'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: inventoryCompanyDirId,
        metadata: JSON.stringify({
          value: 'textiles',
          name: 'Textiles'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: inventoryCompanyDirId,
        metadata: JSON.stringify({
          value: 'machinery',
          name: 'Machinery'
        }),
        created_at: now,
        updated_at: now
      },
      // Raw Materials
      {
        id: uuidv4(),
        company_directory_id: rawMaterialsCompanyDirId,
        metadata: JSON.stringify({
          value: 'circuits',
          name: 'Electronic Circuits',
          parentValue: 'electronics'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: rawMaterialsCompanyDirId,
        metadata: JSON.stringify({
          value: 'sensors',
          name: 'Sensors',
          parentValue: 'electronics'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: rawMaterialsCompanyDirId,
        metadata: JSON.stringify({
          value: 'cotton',
          name: 'Cotton',
          parentValue: 'textiles'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: rawMaterialsCompanyDirId,
        metadata: JSON.stringify({
          value: 'silk',
          name: 'Silk',
          parentValue: 'textiles'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: rawMaterialsCompanyDirId,
        metadata: JSON.stringify({
          value: 'steel',
          name: 'Steel',
          parentValue: 'machinery'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: rawMaterialsCompanyDirId,
        metadata: JSON.stringify({
          value: 'aluminum',
          name: 'Aluminum',
          parentValue: 'machinery'
        }),
        created_at: now,
        updated_at: now
      },
      // Departments
      {
        id: uuidv4(),
        company_directory_id: departmentsCompanyDirId,
        metadata: JSON.stringify({
          value: 'engineering',
          name: 'Engineering'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: departmentsCompanyDirId,
        metadata: JSON.stringify({
          value: 'marketing',
          name: 'Marketing'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: departmentsCompanyDirId,
        metadata: JSON.stringify({
          value: 'finance',
          name: 'Finance'
        }),
        created_at: now,
        updated_at: now
      },
      // Employees
      {
        id: uuidv4(),
        company_directory_id: employeesCompanyDirId,
        metadata: JSON.stringify({
          value: 'john_doe',
          name: 'John Doe',
          parentValue: 'engineering'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: employeesCompanyDirId,
        metadata: JSON.stringify({
          value: 'jane_smith',
          name: 'Jane Smith',
          parentValue: 'engineering'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: employeesCompanyDirId,
        metadata: JSON.stringify({
          value: 'bob_wilson',
          name: 'Bob Wilson',
          parentValue: 'marketing'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: employeesCompanyDirId,
        metadata: JSON.stringify({
          value: 'alice_brown',
          name: 'Alice Brown',
          parentValue: 'marketing'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: employeesCompanyDirId,
        metadata: JSON.stringify({
          value: 'charlie_davis',
          name: 'Charlie Davis',
          parentValue: 'finance'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_directory_id: employeesCompanyDirId,
        metadata: JSON.stringify({
          value: 'diana_evans',
          name: 'Diana Evans',
          parentValue: 'finance'
        }),
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('directory_records', additionalRecords);

    // Create directory values for additional records
    const additionalValues = [
      // Inventory values
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[0].id,
        field_id: fieldIds.inventory,
        value: 'electronics',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[1].id,
        field_id: fieldIds.inventory,
        value: 'textiles',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[2].id,
        field_id: fieldIds.inventory,
        value: 'machinery',
        created_at: now,
        updated_at: now
      },
      // Raw Materials values
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[3].id,
        field_id: fieldIds.rawMaterials,
        value: 'circuits',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[4].id,
        field_id: fieldIds.rawMaterials,
        value: 'sensors',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[5].id,
        field_id: fieldIds.rawMaterials,
        value: 'cotton',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[6].id,
        field_id: fieldIds.rawMaterials,
        value: 'silk',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[7].id,
        field_id: fieldIds.rawMaterials,
        value: 'steel',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[8].id,
        field_id: fieldIds.rawMaterials,
        value: 'aluminum',
        created_at: now,
        updated_at: now
      },
      // Department values
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[9].id,
        field_id: fieldIds.departments,
        value: 'engineering',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[10].id,
        field_id: fieldIds.departments,
        value: 'marketing',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[11].id,
        field_id: fieldIds.departments,
        value: 'finance',
        created_at: now,
        updated_at: now
      },
      // Employee values
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[12].id,
        field_id: fieldIds.employees,
        value: 'john_doe',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[13].id,
        field_id: fieldIds.employees,
        value: 'jane_smith',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[14].id,
        field_id: fieldIds.employees,
        value: 'bob_wilson',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[15].id,
        field_id: fieldIds.employees,
        value: 'alice_brown',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[16].id,
        field_id: fieldIds.employees,
        value: 'charlie_davis',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        directory_record_id: additionalRecords[17].id,
        field_id: fieldIds.employees,
        value: 'diana_evans',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('directory_values', additionalValues);

  },

  down: async (queryInterface, Sequelize) => {
    // First, get the directory IDs for cascading directories
    const cascadingDirectories = await queryInterface.sequelize.query(
      'SELECT id FROM directories WHERE name IN (\'Payment Types\', \'Inventory\', \'Raw Materials\', \'Departments\');',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (cascadingDirectories.length > 0) {
      const directoryIds = cascadingDirectories.map(dir => dir.id);

      // Delete related directory_values first
      await queryInterface.sequelize.query(
        'DELETE FROM directory_values WHERE directory_record_id IN (SELECT id FROM directory_records WHERE company_directory_id IN (SELECT id FROM company_directories WHERE directory_id = ANY(?)));',
        { replacements: [directoryIds] }
      );

      // Delete related directory_records
      await queryInterface.sequelize.query(
        'DELETE FROM directory_records WHERE company_directory_id IN (SELECT id FROM company_directories WHERE directory_id = ANY(?));',
        { replacements: [directoryIds] }
      );

      // Delete related directory_fields
      await queryInterface.sequelize.query(
        'DELETE FROM directory_fields WHERE directory_id = ANY(?);',
        { replacements: [directoryIds] }
      );

      // Delete related company_directories
      await queryInterface.sequelize.query(
        'DELETE FROM company_directories WHERE directory_id = ANY(?);',
        { replacements: [directoryIds] }
      );

      // Finally, delete the directories
      await queryInterface.sequelize.query(
        'DELETE FROM directories WHERE id = ANY(?);',
        { replacements: [directoryIds] }
      );
    }
  }
}; 