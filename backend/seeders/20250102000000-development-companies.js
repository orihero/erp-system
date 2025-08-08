'use strict';

const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();
      console.log('Creating Uzbek companies for development...');

      // Set faker locale to Uzbek
      faker.locale = 'uz';

      const uzbekCompanies = [
        {
          id: uuidv4(),
          name: 'Tashkent Textile Group',
          admin_email: 'admin@tashkenttextile.uz',
          employee_count: '100_to_500',
          status: 'active',
          logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200',
          address: 'Chilanzar tumani, Tashkent shahri, O\'zbekiston',
          description: 'Tashkent shahridagi eng yirik to\'qimachilik korxonalaridan biri. 1995-yildan beri faoliyat ko\'rsatmoqda.',
          website: 'https://tashkenttextile.uz',
          phone: '+998 71 123 45 67',
          tax_id: '123456789',
          registration_number: 'TXT-001-95',
          industry: 'Textiles',
          founded_year: 1995,
          contacts: JSON.stringify({
            ceo: 'Azizov Aziz Azizovich',
            support: 'support@tashkenttextile.uz',
            phone: '+998 71 123 45 68'
          }),
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Samarkand Trading Company',
          admin_email: 'admin@samarkandtrading.uz',
          employee_count: '50_to_100',
          status: 'active',
          logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200',
          address: 'Samarkand shahri, Registon ko\'chasi, O\'zbekiston',
          description: 'Samarkand viloyatida savdo va eksport-import faoliyati bilan shug\'ullanuvchi kompaniya.',
          website: 'https://samarkandtrading.uz',
          phone: '+998 66 234 56 78',
          tax_id: '234567890',
          registration_number: 'STC-002-98',
          industry: 'Trade',
          founded_year: 1998,
          contacts: JSON.stringify({
            ceo: 'Karimov Karim Karimovich',
            support: 'support@samarkandtrading.uz',
            phone: '+998 66 234 56 79'
          }),
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Bukhara Agricultural Enterprise',
          admin_email: 'admin@bukharaagro.uz',
          employee_count: '500_to_1000',
          status: 'active',
          logo: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200',
          address: 'Bukhara viloyati, Jondor tumani, O\'zbekiston',
          description: 'Bukhara viloyatida qishloq xo\'jaligi mahsulotlarini yetishtirish va qayta ishlash bilan shug\'ullanadi.',
          website: 'https://bukharaagro.uz',
          phone: '+998 65 345 67 89',
          tax_id: '345678901',
          registration_number: 'BAE-003-2000',
          industry: 'Agriculture',
          founded_year: 2000,
          contacts: JSON.stringify({
            ceo: 'Nurmatov Nurmat Nurmatovich',
            support: 'support@bukharaagro.uz',
            phone: '+998 65 345 67 90'
          }),
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Andijan Manufacturing Solutions',
          admin_email: 'admin@andijanmanufacturing.uz',
          employee_count: '100_to_500',
          status: 'active',
          logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200',
          address: 'Andijan shahri, Industrial zone, O\'zbekiston',
          description: 'Andijan viloyatida ishlab chiqarish va texnologiya sohasida faoliyat ko\'rsatuvchi korxona.',
          website: 'https://andijanmanufacturing.uz',
          phone: '+998 74 456 78 90',
          tax_id: '456789012',
          registration_number: 'AMS-004-2002',
          industry: 'Manufacturing',
          founded_year: 2002,
          contacts: JSON.stringify({
            ceo: 'Rahimov Rahim Rahimovich',
            support: 'support@andijanmanufacturing.uz',
            phone: '+998 74 456 78 91'
          }),
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          name: 'Fergana Logistics Center',
          admin_email: 'admin@ferganalogistics.uz',
          employee_count: '50_to_100',
          status: 'active',
          logo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=200',
          address: 'Fergana shahri, Transport ko\'chasi, O\'zbekiston',
          description: 'Fergana viloyatida logistika va transport xizmatlari ko\'rsatuvchi markaz.',
          website: 'https://ferganalogistics.uz',
          phone: '+998 73 567 89 01',
          tax_id: '567890123',
          registration_number: 'FLC-005-2005',
          industry: 'Logistics',
          founded_year: 2005,
          contacts: JSON.stringify({
            ceo: 'Toshmatov Toshmat Toshmatovich',
            support: 'support@ferganalogistics.uz',
            phone: '+998 73 567 89 02'
          }),
          created_at: now,
          updated_at: now
        }
      ];

      await queryInterface.bulkInsert('companies', uzbekCompanies, {});

      console.log('Uzbek companies created successfully!');
      console.log('Companies created:');
      uzbekCompanies.forEach(company => {
        console.log(`- ${company.name} (${company.industry})`);
      });

    } catch (error) {
      console.error('Error creating Uzbek companies:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing Uzbek companies...');
      await queryInterface.bulkDelete('companies', null, {});
      console.log('Uzbek companies removed successfully!');
    } catch (error) {
      console.error('Error removing Uzbek companies:', error);
      throw error;
    }
  }
}; 