'use strict';

const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();
      console.log('Creating realistic directory records for Uzbek companies...');

      // Set faker locale to Uzbek
      faker.locale = 'uz';

      // Get company_directories for Uzbek companies
      const companyDirectories = await queryInterface.sequelize.query(
        'SELECT cd.id, cd.company_id, d.name, d.directory_type, c.name as company_name FROM company_directories cd JOIN directories d ON cd.directory_id = d.id JOIN companies c ON cd.company_id = c.id WHERE c.name LIKE \'%Uzbek%\' OR c.name LIKE \'%Tashkent%\' OR c.name LIKE \'%Samarkand%\' OR c.name LIKE \'%Bukhara%\' OR c.name LIKE \'%Andijan%\' OR c.name LIKE \'%Fergana%\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!companyDirectories || companyDirectories.length === 0) {
        throw new Error('No company directories found. Please run the directories seeder first.');
      }

      const directoryRecords = [];

      // Realistic data templates for different directory types
      const recordTemplates = {
        'Tizim foydalanuvchilari': {
          count: 25,
          template: (index) => ({
            title: `${faker.person.firstName()} ${faker.person.lastName()}`,
            description: `Tizim foydalanuvchisi ${index + 1} haqida ma'lumot`,
            data: JSON.stringify({
              username: `user${index + 1}`,
              email: faker.internet.email(),
              role: faker.helpers.arrayElement(['admin', 'manager', 'user', 'supervisor', 'analyst']),
              status: faker.helpers.arrayElement(['active', 'inactive']),
              last_login: faker.date.recent(),
              department: faker.helpers.arrayElement(['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'])
            }),
            metadata: JSON.stringify({
              category: 'system_user',
              priority: faker.helpers.arrayElement(['low', 'medium', 'high'])
            })
          })
        },
        'Kompaniya xodimlari': {
          count: 20,
          template: (index) => ({
            title: `${faker.person.fullName()}`,
            description: `Xodim ${index + 1} ma'lumotlari`,
            data: JSON.stringify({
              position: faker.helpers.arrayElement(['Menejer', 'Muhandis', 'Buxgalter', 'Sotuvchi', 'Operator', 'Direktor', 'Muhandis', 'Texnik', 'Hodim']),
              department: faker.helpers.arrayElement(['Boshqaruv', 'Ishlab chiqarish', 'Sotuv', 'Moliyaviy', 'IT', 'Marketing', 'Xizmat ko\'rsatish']),
              salary: faker.number.int({ min: 2000000, max: 15000000 }),
              hire_date: faker.date.past({ years: 5 }),
              phone: faker.phone.number('+998 ## ### ## ##'),
              address: faker.location.streetAddress()
            }),
            metadata: JSON.stringify({
              category: 'employee',
              status: faker.helpers.arrayElement(['active', 'vacation', 'sick_leave'])
            })
          })
        },
        'Kompaniya mijozlari': {
          count: 50, // More realistic number of clients
          template: (index) => {
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

            const addresses = [
              'Toshkent shahri, Chilonzor tumani, 1-uy', 'Toshkent shahri, Sergeli tumani, 2-uy',
              'Toshkent shahri, Yashnabod tumani, 3-uy', 'Toshkent shahri, Mirzo Ulug\'bek tumani, 4-uy',
              'Toshkent shahri, Shayxontohur tumani, 5-uy', 'Toshkent shahri, Olmazor tumani, 6-uy',
              'Toshkent shahri, Bektemir tumani, 7-uy', 'Toshkent shahri, Uchtepa tumani, 8-uy',
              'Toshkent shahri, Yangihayot tumani, 9-uy', 'Toshkent shahri, Qibray tumani, 10-uy',
              'Samarkand shahri, markaziy tuman, 11-uy', 'Bukhara shahri, eski shahar, 12-uy',
              'Andijan shahri, yangi qurilish, 13-uy', 'Fergana shahri, sanoat zonasi, 14-uy'
            ];

            const emails = [
              'info@toshkenttextile.uz', 'contact@samarkandtrading.uz', 'sales@bukharafoods.uz',
              'admin@andijanconstruction.uz', 'support@ferganaelectronics.uz', 'info@namangantextiles.uz',
              'contact@kashkadaryalogistics.uz', 'sales@surkhandaryamining.uz', 'admin@khorezmagriculture.uz',
              'support@navoiyindustrial.uz', 'info@jizzakhservices.uz', 'contact@sirdaryamanufacturing.uz',
              'sales@tashkentregiontrading.uz', 'admin@karakalpakstanresources.uz', 'support@uzbekistanexport.uz'
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
              '2024-01-15', '2024-02-20', '2024-03-10', '2024-04-05', '2024-05-12',
              '2024-06-18', '2024-07-25', '2024-08-30', '2024-09-14', '2024-10-22',
              '2024-11-08', '2024-12-03', '2025-01-17', '2025-02-28', '2025-03-15'
            ];

            const creditLimits = [
              203886.65, 634128.22, 775952.14, 456789.32, 987654.21,
              345678.90, 567890.12, 789012.34, 234567.89, 678901.23,
              456789.01, 890123.45, 123456.78, 567890.12, 345678.90
            ];

            return {
              title: companyNames[index % companyNames.length],
              description: `Mijoz ${index + 1} ma'lumotlari`,
              data: JSON.stringify({
                contact_person: directorNames[index % directorNames.length],
                phone: phoneNumbers[index % phoneNumbers.length],
                email: emails[index % emails.length],
                address: addresses[index % addresses.length],
                contract_value: faker.number.int({ min: 10000000, max: 100000000 }),
                contract_date: contractDates[index % contractDates.length]
              }),
              metadata: JSON.stringify({
                category: 'customer',
                type: faker.helpers.arrayElement(['regular', 'vip', 'wholesale']),
                inn: innNumbers[index % innNumbers.length],
                contract_number: contractNumbers[index % contractNumbers.length],
                credit_limit: creditLimits[index % creditLimits.length],
                active: index % 3 === 0 ? 'false' : 'true' // 2/3 active, 1/3 inactive
              })
            };
          }
        },
        'Tovar-moddiy boyliklar': {
          count: 30,
          template: (index) => ({
            title: `${faker.commerce.productName()}`,
            description: `Tovar ${index + 1} ma'lumotlari`,
            data: JSON.stringify({
              category: faker.helpers.arrayElement(['To\'qimachilik', 'Elektronika', 'Oziq-ovqat', 'Qurilish materiallari', 'Avtomobil qismlari', 'Dori-darmon', 'Kimyoviy moddalar']),
              price: faker.number.int({ min: 50000, max: 5000000 }),
              quantity: faker.number.int({ min: 10, max: 1000 }),
              unit: faker.helpers.arrayElement(['dona', 'kg', 'metr', 'litr', 'paket', 'quti']),
              supplier: faker.company.name(),
              expiry_date: faker.date.future()
            }),
            metadata: JSON.stringify({
              category: 'inventory',
              status: faker.helpers.arrayElement(['in_stock', 'low_stock', 'out_of_stock'])
            })
          })
        },
        'Omborlar': {
          count: 12,
          template: (index) => ({
            title: `Ombor ${index + 1}`,
            description: `Ombor ${index + 1} ma'lumotlari`,
            data: JSON.stringify({
              location: faker.location.streetAddress(),
              capacity: faker.number.int({ min: 1000, max: 10000 }),
              manager: faker.person.fullName(),
              phone: faker.phone.number('+998 ## ### ## ##'),
              temperature: faker.number.int({ min: 15, max: 25 }),
              humidity: faker.number.int({ min: 40, max: 70 })
            }),
            metadata: JSON.stringify({
              category: 'warehouse',
              type: faker.helpers.arrayElement(['main', 'branch', 'temporary'])
            })
          })
        },
        'Sotuvlar': {
          count: 40,
          template: (index) => ({
            title: `Sotuv ${index + 1}`,
            description: `Sotuv ${index + 1} ma'lumotlari`,
            data: JSON.stringify({
              customer: faker.person.fullName(),
              product: faker.commerce.productName(),
              quantity: faker.number.int({ min: 1, max: 50 }),
              unit_price: faker.number.int({ min: 10000, max: 500000 }),
              total_amount: faker.number.int({ min: 100000, max: 25000000 }),
              payment_method: faker.helpers.arrayElement(['naqd', 'karta', 'bank o\'tkazmasi']),
              sales_date: faker.date.recent()
            }),
            metadata: JSON.stringify({
              category: 'sale',
              status: faker.helpers.arrayElement(['completed', 'pending', 'cancelled'])
            })
          })
        },
        'Xaridlar': {
          count: 25,
          template: (index) => ({
            title: `Xarid ${index + 1}`,
            description: `Xarid ${index + 1} ma'lumotlari`,
            data: JSON.stringify({
              supplier: faker.company.name(),
              product: faker.commerce.productName(),
              quantity: faker.number.int({ min: 10, max: 500 }),
              unit_price: faker.number.int({ min: 5000, max: 200000 }),
              total_amount: faker.number.int({ min: 50000, max: 100000000 }),
              order_date: faker.date.recent(),
              delivery_date: faker.date.future()
            }),
            metadata: JSON.stringify({
              category: 'purchase',
              status: faker.helpers.arrayElement(['ordered', 'delivered', 'cancelled'])
            })
          })
        },
        'Buxgalteriya hisoblar': {
          count: 15,
          template: (index) => ({
            title: `Hisob ${index + 1}`,
            description: `Buxgalteriya hisobi ${index + 1}`,
            data: JSON.stringify({
              account_number: faker.finance.accountNumber(),
              account_name: faker.helpers.arrayElement(['Naqd pul', 'Bank hisobi', 'Kreditorlar', 'Debitorlar', 'Asosiy vositalar', 'Materiallar', 'Mahsulot', 'Sotuvlar', 'Xaridlar', 'Zararlar']),
              balance: faker.number.int({ min: -10000000, max: 100000000 }),
              currency: 'UZS',
              last_transaction: faker.date.recent()
            }),
            metadata: JSON.stringify({
              category: 'account',
              type: faker.helpers.arrayElement(['asset', 'liability', 'equity'])
            })
          })
        },
        'Kassa operatsiyalari': {
          count: 60,
          template: (index) => ({
            title: `Operatsiya ${index + 1}`,
            description: `Kassa operatsiyasi ${index + 1}`,
            data: JSON.stringify({
              operation_type: faker.helpers.arrayElement(['kirim', 'chiqim']),
              amount: faker.number.int({ min: 10000, max: 5000000 }),
              description: faker.lorem.sentence(),
              cashier: faker.person.fullName(),
              operation_date: faker.date.recent(),
              receipt_number: faker.string.alphanumeric(8).toUpperCase()
            }),
            metadata: JSON.stringify({
              category: 'transaction',
              payment_method: faker.helpers.arrayElement(['naqd', 'karta', 'chek'])
            })
          })
        }
      };

      companyDirectories.forEach(companyDirectory => {
        const template = recordTemplates[companyDirectory.name];
        if (template) {
          for (let i = 0; i < template.count; i++) {
            const record = template.template(i);
            directoryRecords.push({
              id: uuidv4(),
              company_directory_id: companyDirectory.id,
              metadata: JSON.stringify({
                title: record.title,
                description: record.description,
                data: record.data,
                ...record.metadata
              }),
              created_at: now,
              updated_at: now
            });
          }
          console.log(`Created ${template.count} realistic records for ${companyDirectory.name} (${companyDirectory.company_name})`);
        } else {
          // Default template for other directories
          const defaultCount = Math.floor(Math.random() * 3) + 3; // 3-5 records
          for (let i = 0; i < defaultCount; i++) {
            directoryRecords.push({
              id: uuidv4(),
              company_directory_id: companyDirectory.id,
              metadata: JSON.stringify({
                title: `${companyDirectory.name} yozuv ${i + 1}`,
                description: `${companyDirectory.name} yozuv ${i + 1} ma'lumotlari`,
                data: {
                  field1: faker.lorem.word(),
                  field2: faker.number.int({ min: 1, max: 1000 }),
                  field3: faker.date.recent(),
                  field4: faker.person.fullName()
                },
                category: 'default',
                status: faker.helpers.arrayElement(['active', 'inactive'])
              }),
              created_at: now,
              updated_at: now
            });
          }
          console.log(`Created ${defaultCount} default records for ${companyDirectory.name} (${companyDirectory.company_name})`);
        }
      });

      await queryInterface.bulkInsert('directory_records', directoryRecords, {});

      console.log('Realistic directory records created successfully!');
      console.log(`Total directory records created: ${directoryRecords.length}`);

    } catch (error) {
      console.error('Error creating directory records:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing directory records...');
      
      // Get Uzbek company directory IDs
      const uzbekCompanyDirectoryIds = await queryInterface.sequelize.query(
        'SELECT cd.id FROM company_directories cd JOIN companies c ON cd.company_id = c.id WHERE c.name LIKE \'%Uzbek%\' OR c.name LIKE \'%Tashkent%\' OR c.name LIKE \'%Samarkand%\' OR c.name LIKE \'%Bukhara%\' OR c.name LIKE \'%Andijan%\' OR c.name LIKE \'%Fergana%\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (uzbekCompanyDirectoryIds.length > 0) {
        const companyDirectoryIds = uzbekCompanyDirectoryIds.map(cd => cd.id);
        await queryInterface.bulkDelete('directory_records', {
          company_directory_id: companyDirectoryIds
        }, {});
      }

      console.log('Directory records removed successfully!');
    } catch (error) {
      console.error('Error removing directory records:', error);
      throw error;
    }
  }
}; 