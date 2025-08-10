'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();
      console.log('Creating realistic sample directory records...');

      // Get company directories for Uzbek companies
      const companyDirectories = await queryInterface.sequelize.query(
        `SELECT cd.id, cd.company_id, d.name as directory_name, d.id as directory_id 
         FROM company_directories cd 
         JOIN directories d ON cd.directory_id = d.id 
         JOIN companies c ON cd.company_id = c.id 
         WHERE c.name LIKE '%Uzbek%' OR c.name LIKE '%Tashkent%' OR c.name LIKE '%Samarkand%' OR c.name LIKE '%Bukhara%' OR c.name LIKE '%Andijan%' OR c.name LIKE '%Fergana%'
         LIMIT 5;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!companyDirectories || companyDirectories.length === 0) {
        throw new Error('No company directories found. Please run the directories seeder first.');
      }

      // Get directory fields for the selected directories
      const directoryFields = await queryInterface.sequelize.query(
        `SELECT df.id, df.directory_id, df.name, df.type, df.relation_id, df.metadata
         FROM directory_fields df 
         JOIN directories d ON df.directory_id = d.id 
         WHERE d.id IN (${companyDirectories.map(cd => `'${cd.directory_id}'`).join(',')});`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      const directoryRecords = [];
      const directoryValues = [];

      // Realistic data arrays for client information
      const clientIds = [
        'Mijoz_001', 'Mijoz_002', 'Mijoz_003', 'Mijoz_004', 'Mijoz_005',
        'Mijoz_006', 'Mijoz_007', 'Mijoz_008', 'Mijoz_009', 'Mijoz_010',
        'Mijoz_011', 'Mijoz_012', 'Mijoz_013', 'Mijoz_014', 'Mijoz_015'
      ];

      const companyNames = [
        'Toshkent Textile MChJ', 'Samarkand Trading LLC', 'Bukhara Foods Ltd', 
        'Andijan Construction Co', 'Fergana Electronics', 'Namangan Textiles',
        'Kashkadarya Logistics', 'Surkhandarya Mining', 'Khorezm Agriculture',
        'Navoiy Industrial', 'Jizzakh Services', 'Sirdarya Manufacturing',
        'Tashkent Region Trading', 'Karakalpakstan Resources', 'Uzbekistan Export'
      ];

      const directorNames = [
        'Aziz Karimov', 'Malika Toshmatova', 'Rustam Abdullayev', 'Dilfuza Mirzaeva',
        'Jamshid Rakhimov', 'Zulfiya Karimova', 'Bakhtiyor Tashmatov', 'Gulnora Abdullayeva',
        'Shavkat Mirzaev', 'Feruza Rakhimova', 'Jasur Karimov', 'Madina Toshmatova',
        'Alisher Abdullayev', 'Dilbar Mirzaeva', 'Ravshan Rakhimov'
      ];

      const phoneNumbers = [
        '+998 90 7506742', '+998 90 4138089', '+998 90 4554895', '+998 90 1234567',
        '+998 90 2345678', '+998 90 3456789', '+998 90 4567890', '+998 90 5678901',
        '+998 90 6789012', '+998 90 7890123', '+998 90 8901234', '+998 90 9012345',
        '+998 90 0123456', '+998 90 1111111', '+998 90 2222222'
      ];

      const emails = [
        'info@toshkenttextile.uz', 'contact@samarkandtrading.uz', 'sales@bukharafoods.uz',
        'admin@andijanconstruction.uz', 'support@ferganaelectronics.uz', 'info@namangantextiles.uz',
        'contact@kashkadaryalogistics.uz', 'sales@surkhandaryamining.uz', 'admin@khorezmagriculture.uz',
        'support@navoiyindustrial.uz', 'info@jizzakhservices.uz', 'contact@sirdaryamanufacturing.uz',
        'sales@tashkentregiontrading.uz', 'admin@karakalpakstanresources.uz', 'support@uzbekistanexport.uz'
      ];

      const addresses = [
        'Toshkent shahri, Chilonzor tumani, 1-uy', 'Toshkent shahri, Sergeli tumani, 2-uy',
        'Toshkent shahri, Yashnabod tumani, 3-uy', 'Toshkent shahri, Mirzo Ulug\'bek tumani, 4-uy',
        'Toshkent shahri, Shayxontohur tumani, 5-uy', 'Toshkent shahri, Olmazor tumani, 6-uy',
        'Toshkent shahri, Bektemir tumani, 7-uy', 'Toshkent shahri, Uchtepa tumani, 8-uy',
        'Toshkent shahri, Yangihayot tumani, 9-uy', 'Toshkent shahri, Qibray tumani, 10-uy',
        'Samarkand shahri, markaziy tuman, 11-uy', 'Bukhara shahri, eski shahar, 12-uy',
        'Andijan shahri, yangi qurilish, 13-uy', 'Fergana shahri, sanoat zonasi, 14-uy',
        'Namangan shahri, markaziy tuman, 15-uy'
      ];

      const innNumbers = [
        '123456789', '234567890', '345678901', '456789012', '567890123',
        '678901234', '789012345', '890123456', '901234567', '012345678',
        '111111111', '222222222', '333333333', '444444444', '555555555'
      ];

      const contractNumbers = [
        'CON-2024-001', 'CON-2024-002', 'CON-2024-003', 'CON-2024-004', 'CON-2024-005',
        'CON-2024-006', 'CON-2024-007', 'CON-2024-008', 'CON-2024-009', 'CON-2024-010',
        'CON-2024-011', 'CON-2024-012', 'CON-2024-013', 'CON-2024-014', 'CON-2024-015'
      ];

      const contractDates = [
        '2025-08-07', '2025-08-08', '2025-08-09', '2025-08-10', '2025-08-11',
        '2025-08-12', '2025-08-13', '2025-08-14', '2025-08-15', '2025-08-16',
        '2025-08-17', '2025-08-18', '2025-08-19', '2025-08-20', '2025-08-21'
      ];

      const creditLimits = [
        203886.65, 634128.22, 775952.14, 456789.32, 987654.21,
        345678.90, 567890.12, 789012.34, 234567.89, 678901.23,
        456789.01, 890123.45, 123456.78, 567890.12, 345678.90
      ];

      const activeStatuses = ['false', 'true', 'false', 'true', 'false', 'true', 'false', 'true', 'false', 'true', 'false', 'true', 'false', 'true', 'false'];

      // Additional realistic data for other directory types
      const employeeNames = [
        'Aziz Karimov', 'Malika Toshmatova', 'Rustam Abdullayev', 'Dilfuza Mirzaeva',
        'Jamshid Rakhimov', 'Zulfiya Karimova', 'Bakhtiyor Tashmatov', 'Gulnora Abdullayeva',
        'Shavkat Mirzaev', 'Feruza Rakhimova', 'Jasur Karimov', 'Madina Toshmatova',
        'Alisher Abdullayev', 'Dilbar Mirzaeva', 'Ravshan Rakhimov'
      ];

      const positions = [
        'Menejer', 'Muhandis', 'Buxgalter', 'Sotuvchi', 'Operator', 'Direktor',
        'Texnik', 'Hodim', 'Muhandis', 'Boshqaruvchi', 'Analitik', 'Konsultant'
      ];

      const departments = [
        'Boshqaruv', 'Ishlab chiqarish', 'Sotuv', 'Moliyaviy', 'IT', 'Marketing',
        'Xizmat ko\'rsatish', 'Logistika', 'Xavfsizlik', 'Kadrlar'
      ];

      const productNames = [
        'Pambuk to\'qimasi', 'Elektron qurilma', 'Oziq-ovqat mahsuloti', 'Qurilish materiali',
        'Avtomobil qismi', 'Dori-darmon', 'Kimyoviy modda', 'Plastik mahsulot',
        'Metall buyum', 'Keramika', 'Shisha mahsulot', 'Daraxt'
      ];

      const categories = [
        'To\'qimachilik', 'Elektronika', 'Oziq-ovqat', 'Qurilish materiallari',
        'Avtomobil qismlari', 'Dori-darmon', 'Kimyoviy moddalar', 'Plastik',
        'Metall', 'Keramika', 'Shisha', 'Agro'
      ];

      const units = ['dona', 'kg', 'metr', 'litr', 'paket', 'quti', 'tonna', 'metr kvadrat'];

      const accountNames = [
        'Naqd pul', 'Bank hisobi', 'Kreditorlar', 'Debitorlar', 'Asosiy vositalar',
        'Materiallar', 'Mahsulot', 'Sotuvlar', 'Xaridlar', 'Zararlar'
      ];

      const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];

      const currencies = ['UZS', 'USD', 'EUR', 'RUB'];

      const operationTypes = ['kirim', 'chiqim', 'o\'tkazma', 'chek'];

      const paymentMethods = ['naqd', 'karta', 'bank o\'tkazmasi', 'chek'];

      const salesStatuses = ['completed', 'pending', 'cancelled', 'refunded'];

      const purchaseStatuses = ['ordered', 'delivered', 'cancelled', 'returned'];

      // Create sample records for each company directory
      for (const companyDirectory of companyDirectories) {
        const fields = directoryFields.filter(f => f.directory_id === companyDirectory.directory_id);
        
        if (fields.length === 0) continue;

        // Create 15 sample records for each directory (matching the screenshot)
        for (let i = 0; i < 15; i++) {
          const recordId = uuidv4();
          directoryRecords.push({
            id: recordId,
            company_directory_id: companyDirectory.id,
            metadata: JSON.stringify({
              cascadingConfig: {
                enabled: false,
                dependentFields: []
              }
            }),
            created_at: now,
            updated_at: now
          });

          // Create values for each field
          fields.forEach(field => {
            let value = '';
            
            // Generate realistic data based on field type and name
            switch (field.type) {
              case 'text':
                if (field.name.includes('ID') || field.name.includes('Mijoz ID')) {
                  value = clientIds[i % clientIds.length];
                } else if (field.name.includes('Kompaniya nomi')) {
                  value = companyNames[i % companyNames.length];
                } else if (field.name.includes('Direktor')) {
                  value = directorNames[i % directorNames.length];
                } else if (field.name.includes('Telefon')) {
                  value = phoneNumbers[i % phoneNumbers.length];
                } else if (field.name.includes('Email')) {
                  value = emails[i % emails.length];
                } else if (field.name.includes('Manzil')) {
                  value = addresses[i % addresses.length];
                } else if (field.name.includes('INN')) {
                  value = innNumbers[i % innNumbers.length];
                } else if (field.name.includes('Shartnoma raqami')) {
                  value = contractNumbers[i % contractNumbers.length];
                } else if (field.name.includes('Ism')) {
                  value = employeeNames[i % employeeNames.length];
                } else if (field.name.includes('Familiya')) {
                  value = employeeNames[i % employeeNames.length];
                } else if (field.name.includes('Lavozim')) {
                  value = positions[i % positions.length];
                } else if (field.name.includes('Bo\'lim')) {
                  value = departments[i % departments.length];
                } else if (field.name.includes('Nomi')) {
                  value = productNames[i % productNames.length];
                } else if (field.name.includes('Kategoriya')) {
                  value = categories[i % categories.length];
                } else if (field.name.includes('Birlik')) {
                  value = units[i % units.length];
                } else if (field.name.includes('Hisob nomi')) {
                  value = accountNames[i % accountNames.length];
                } else if (field.name.includes('Hisob turi')) {
                  value = accountTypes[i % accountTypes.length];
                } else if (field.name.includes('Valyuta')) {
                  value = currencies[i % currencies.length];
                } else if (field.name.includes('Operatsiya turi')) {
                  value = operationTypes[i % operationTypes.length];
                } else if (field.name.includes('To\'lov turi')) {
                  value = paymentMethods[i % paymentMethods.length];
                } else if (field.name.includes('Holat')) {
                  if (companyDirectory.directory_name.includes('Sotuv')) {
                    value = salesStatuses[i % salesStatuses.length];
                  } else if (companyDirectory.directory_name.includes('Xarid')) {
                    value = purchaseStatuses[i % purchaseStatuses.length];
                  } else {
                    value = i % 2 === 0 ? 'active' : 'inactive';
                  }
                } else {
                  value = `Realistic ${field.name} ${i + 1}`;
                }
                break;
              
              case 'bool':
                if (field.name.includes('Faol')) {
                  value = activeStatuses[i % activeStatuses.length];
                } else {
                  value = i % 2 === 0 ? 'true' : 'false';
                }
                break;
              
              case 'date':
                if (field.name.includes('Shartnoma sanasi')) {
                  value = contractDates[i % contractDates.length];
                } else if (field.name.includes('Tug\'ilgan sana')) {
                  const birthDate = new Date(1980 + (i % 20), (i % 12), (i % 28) + 1);
                  value = birthDate.toISOString().split('T')[0];
                } else if (field.name.includes('Ishga qabul qilingan sana')) {
                  const hireDate = new Date(2020 + (i % 5), (i % 12), (i % 28) + 1);
                  value = hireDate.toISOString().split('T')[0];
                } else {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  value = date.toISOString().split('T')[0];
                }
                break;
              
              case 'datetime':
                const datetime = new Date();
                datetime.setDate(datetime.getDate() + i);
                value = datetime.toISOString();
                break;
              
              case 'decimal':
                if (field.name.includes('Kredit limiti')) {
                  value = creditLimits[i % creditLimits.length].toString();
                } else if (field.name.includes('Maosh')) {
                  value = (Math.random() * 10000000 + 2000000).toFixed(2);
                } else if (field.name.includes('Narx') || field.name.includes('Summa')) {
                  value = (Math.random() * 1000000 + 10000).toFixed(2);
                } else if (field.name.includes('Balans')) {
                  value = (Math.random() * 100000000 - 50000000).toFixed(2);
                } else {
                  value = (Math.random() * 1000000 + 10000).toFixed(2);
                }
                break;
              
              case 'integer':
                if (field.name.includes('Yil')) {
                  value = 2024 + (i % 3);
                } else if (field.name.includes('Miqdori') || field.name.includes('Quantity')) {
                  value = Math.floor(Math.random() * 1000) + 1;
                } else {
                  value = Math.floor(Math.random() * 100) + 1;
                }
                break;
              
              case 'json':
                if (field.name.includes('Oylar')) {
                  value = JSON.stringify({
                    yanvar: Math.random() * 1000000,
                    fevral: Math.random() * 1000000,
                    mart: Math.random() * 1000000,
                    aprel: Math.random() * 1000000,
                    may: Math.random() * 1000000,
                    iyun: Math.random() * 1000000
                  });
                } else {
                  value = JSON.stringify({ key: `value_${i + 1}`, data: `realistic_${i + 1}` });
                }
                break;
              
              case 'relation':
                // For relation fields, we'll use a placeholder for now
                value = `relation_${i + 1}`;
                break;
              
              default:
                value = `Realistic ${field.name} ${i + 1}`;
            }

            directoryValues.push({
              id: uuidv4(),
              directory_record_id: recordId,
              field_id: field.id,
              value: value,
              created_at: now,
              updated_at: now
            });
          });
        }
      }

      await queryInterface.bulkInsert('directory_records', directoryRecords, {});
      await queryInterface.bulkInsert('directory_values', directoryValues, {});

      console.log('Realistic sample directory records created successfully!');
      console.log(`Total directory records created: ${directoryRecords.length}`);
      console.log(`Total directory values created: ${directoryValues.length}`);

    } catch (error) {
      console.error('Error creating realistic sample directory records:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing realistic sample directory records...');
      
      // Get company directories for Uzbek companies
      const companyDirectories = await queryInterface.sequelize.query(
        `SELECT cd.id FROM company_directories cd 
         JOIN companies c ON cd.company_id = c.id 
         WHERE c.name LIKE '%Uzbek%' OR c.name LIKE '%Tashkent%' OR c.name LIKE '%Samarkand%' OR c.name LIKE '%Bukhara%' OR c.name LIKE '%Andijan%' OR c.name LIKE '%Fergana%';`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (companyDirectories.length > 0) {
        const companyDirectoryIds = companyDirectories.map(cd => cd.id);
        
        // Remove directory values first
        await queryInterface.sequelize.query(
          'DELETE FROM directory_values WHERE directory_record_id IN (SELECT id FROM directory_records WHERE company_directory_id IN (?));',
          { replacements: [companyDirectoryIds] }
        );
        
        // Then remove directory records
        await queryInterface.bulkDelete('directory_records', {
          company_directory_id: companyDirectoryIds
        }, {});
      }

      console.log('Realistic sample directory records removed successfully!');
    } catch (error) {
      console.error('Error removing realistic sample directory records:', error);
      throw error;
    }
  }
}; 