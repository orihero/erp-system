'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();
      console.log('Creating directory fields...');

      // Get all directories
      const directories = await queryInterface.sequelize.query(
        'SELECT id, name, directory_type, metadata FROM directories;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!directories || directories.length === 0) {
        throw new Error('No directories found. Please run the directories seeder first.');
      }

      // Create a map of directory names to IDs for relations
      const directoryMap = {};
      directories.forEach(dir => {
        directoryMap[dir.name] = dir.id;
      });

      const directoryFields = [];

      // Define field templates for different directory types
      const fieldTemplates = {
        // System directories
        'Tizim foydalanuvchilari': [
          { name: 'Foydalanuvchi ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Ism', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Familiya', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Email', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Telefon', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: false } },
          { name: 'Rol', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: true } },
          { name: 'Yaratilgan sana', type: 'datetime', metadata: { isVisibleOnTable: false, fieldOrder: 8, isRequired: false } }
        ],
        'Tizim sozlamalari': [
          { name: 'Sozlama nomi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Qiymat', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Tavsif', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: false } },
          { name: 'Kategoriya', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: true } }
        ],
        'Tizim loglari': [
          { name: 'Log ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Foydalanuvchi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: false } },
          { name: 'Amal', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Ma\'lumot', type: 'json', metadata: { isVisibleOnTable: false, fieldOrder: 4, isRequired: false } },
          { name: 'IP manzil', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: false } },
          { name: 'Sana', type: 'datetime', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } }
        ],

        // Company directories
        'Kompaniya xodimlari': [
          { name: 'Xodim ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Ism', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Familiya', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Otasining ismi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: false } },
          { name: 'Tug\'ilgan sana', type: 'date', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: false } },
          { name: 'Telefon', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } },
          { name: 'Email', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: false } },
          { name: 'Manzil', type: 'text', metadata: { isVisibleOnTable: false, fieldOrder: 8, isRequired: false } },
          { name: 'Lavozim', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 9, isRequired: true } },
          { name: 'Bo\'lim', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 10, isRequired: false } },
          { name: 'Ishga qabul qilingan sana', type: 'date', metadata: { isVisibleOnTable: true, fieldOrder: 11, isRequired: false } },
          { name: 'Maosh', type: 'decimal', metadata: { isVisibleOnTable: false, fieldOrder: 12, isRequired: false } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 13, isRequired: true } }
        ],
        'Kompaniya mijozlari': [
          { name: 'Mijoz ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Kompaniya nomi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Direktor', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: false } },
          { name: 'Telefon', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Email', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: false } },
          { name: 'Manzil', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: false } },
          { name: 'INN', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: false } },
          { name: 'Bank ma\'lumotlari', type: 'text', metadata: { isVisibleOnTable: false, fieldOrder: 8, isRequired: false } },
          { name: 'Shartnoma raqami', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 9, isRequired: false } },
          { name: 'Shartnoma sanasi', type: 'date', metadata: { isVisibleOnTable: true, fieldOrder: 10, isRequired: false } },
          { name: 'Kredit limiti', type: 'decimal', metadata: { isVisibleOnTable: true, fieldOrder: 11, isRequired: false } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 12, isRequired: true } }
        ],
        'Kompaniya tashkilotlari': [
          { name: 'Tashkilot ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Tashkilot nomi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Tashkilot turi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Direktor', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: false } },
          { name: 'Telefon', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: true } },
          { name: 'Email', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: false } },
          { name: 'Manzil', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: false } },
          { name: 'INN', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 8, isRequired: false } },
          { name: 'Shartnoma raqami', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 9, isRequired: false } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 10, isRequired: true } }
        ],
        'Kompaniya loyihalari': [
          { name: 'Loyiha ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Loyiha nomi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Tavsif', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: false } },
          { name: 'Mijoz', type: 'relation', relation_id: null, metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: false } },
          { name: 'Boshlash sanasi', type: 'date', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: false } },
          { name: 'Tugash sanasi', type: 'date', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: false } },
          { name: 'Holat', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: true } },
          { name: 'Byudjet', type: 'decimal', metadata: { isVisibleOnTable: true, fieldOrder: 8, isRequired: false } },
          { name: 'Loyiha rahbari', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 9, isRequired: false } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 10, isRequired: true } }
        ],

        // Module directories
        'Kassa operatsiyalari': [
          { name: 'Operatsiya ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Operatsiya turi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Summa', type: 'decimal', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Valyuta', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Kassa xodimi', type: 'relation', relation_id: null, metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: true } },
          { name: 'Izoh', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: false } },
          { name: 'Sana va vaqt', type: 'datetime', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: true } }
        ],
        'Kassa xodimlari': [
          { name: 'Xodim ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Ism', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Familiya', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Telefon', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Kassa ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: true } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } }
        ],
        'Tovar-moddiy boyliklar': [
          { name: 'Tovar ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Nomi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Kategoriya', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: false } },
          { name: 'Birlik', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Narx', type: 'decimal', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: false } },
          { name: 'Valyuta', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } },
          { name: 'Kod', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: false } },
          { name: 'Barkod', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 8, isRequired: false } },
          { name: 'Tavsif', type: 'text', metadata: { isVisibleOnTable: false, fieldOrder: 9, isRequired: false } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 10, isRequired: true } }
        ],
        'Omborlar': [
          { name: 'Ombor ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Nomi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Manzil', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: false } },
          { name: 'Telefon', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: false } },
          { name: 'Mas\'ul shaxs', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: false } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } }
        ],
        'Sotuvlar': [
          { name: 'Sotuv ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Sotuv raqami', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Mijoz', type: 'relation', relation_id: null, metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: false } },
          { name: 'Sana', type: 'date', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Jami summa', type: 'decimal', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: true } },
          { name: 'Valyuta', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } },
          { name: 'To\'lov turi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: true } },
          { name: 'Holat', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 8, isRequired: true } },
          { name: 'Izoh', type: 'text', metadata: { isVisibleOnTable: false, fieldOrder: 9, isRequired: false } }
        ],
        'Buyurtmalar': [
          { name: 'Buyurtma ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Buyurtma raqami', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Mijoz', type: 'relation', relation_id: null, metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Sana', type: 'date', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Yetkazib berish sanasi', type: 'date', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: false } },
          { name: 'Jami summa', type: 'decimal', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } },
          { name: 'Holat', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: true } },
          { name: 'Izoh', type: 'text', metadata: { isVisibleOnTable: false, fieldOrder: 8, isRequired: false } }
        ],
        'Xaridlar': [
          { name: 'Xarid ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Xarid raqami', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Yetkazib beruvchi', type: 'relation', relation_id: null, metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Sana', type: 'date', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Jami summa', type: 'decimal', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: true } },
          { name: 'Valyuta', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } },
          { name: 'To\'lov turi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: true } },
          { name: 'Holat', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 8, isRequired: true } },
          { name: 'Izoh', type: 'text', metadata: { isVisibleOnTable: false, fieldOrder: 9, isRequired: false } }
        ],
        'Yetkazib beruvchilar': [
          { name: 'Yetkazib beruvchi ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Kompaniya nomi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Direktor', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: false } },
          { name: 'Telefon', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Email', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: false } },
          { name: 'Manzil', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: false } },
          { name: 'INN', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: false } },
          { name: 'Shartnoma raqami', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 8, isRequired: false } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 9, isRequired: true } }
        ],
        'Buxgalteriya hisoblar': [
          { name: 'Hisob ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Hisob raqami', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Hisob nomi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Hisob turi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 4, isRequired: true } },
          { name: 'Balans', type: 'decimal', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: true } },
          { name: 'Valyuta', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: true } }
        ],
        'Byudjet rejalari': [
          { name: 'Reja ID', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 1, isRequired: true } },
          { name: 'Reja nomi', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 2, isRequired: true } },
          { name: 'Yil', type: 'integer', metadata: { isVisibleOnTable: true, fieldOrder: 3, isRequired: true } },
          { name: 'Oylar', type: 'json', metadata: { isVisibleOnTable: false, fieldOrder: 4, isRequired: false } },
          { name: 'Jami byudjet', type: 'decimal', metadata: { isVisibleOnTable: true, fieldOrder: 5, isRequired: true } },
          { name: 'Valyuta', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 6, isRequired: true } },
          { name: 'Holat', type: 'text', metadata: { isVisibleOnTable: true, fieldOrder: 7, isRequired: true } },
          { name: 'Faol', type: 'bool', metadata: { isVisibleOnTable: true, fieldOrder: 8, isRequired: true } }
        ]
      };

      // Create fields for each directory
      for (const directory of directories) {
        const template = fieldTemplates[directory.name];
        if (template) {
          template.forEach(fieldTemplate => {
                         const field = {
               id: uuidv4(),
               directory_id: directory.id,
               name: fieldTemplate.name,
               type: fieldTemplate.type,
               relation_id: fieldTemplate.relation_id,
               metadata: JSON.stringify(fieldTemplate.metadata),
               created_at: now,
               updated_at: now
             };
            directoryFields.push(field);
          });
        }
      }

      // Set up relations between directories
      const relationMappings = [
        { 
          sourceDirectory: 'Kompaniya loyihalari', 
          sourceField: 'Mijoz', 
          targetDirectory: 'Kompaniya mijozlari' 
        },
        { 
          sourceDirectory: 'Sotuvlar', 
          sourceField: 'Mijoz', 
          targetDirectory: 'Kompaniya mijozlari' 
        },
        { 
          sourceDirectory: 'Buyurtmalar', 
          sourceField: 'Mijoz', 
          targetDirectory: 'Kompaniya mijozlari' 
        },
        { 
          sourceDirectory: 'Kassa operatsiyalari', 
          sourceField: 'Kassa xodimi', 
          targetDirectory: 'Kassa xodimlari' 
        },
        { 
          sourceDirectory: 'Xaridlar', 
          sourceField: 'Yetkazib beruvchi', 
          targetDirectory: 'Yetkazib beruvchilar' 
        }
      ];

      // Update relation fields with proper target directory IDs
      for (const mapping of relationMappings) {
        const sourceDir = directories.find(d => d.name === mapping.sourceDirectory);
        const targetDir = directories.find(d => d.name === mapping.targetDirectory);
        
        if (sourceDir && targetDir) {
          const field = directoryFields.find(f => 
            f.directory_id === sourceDir.id && f.name === mapping.sourceField
          );
          
          if (field) {
            field.relation_id = targetDir.id;
          }
        }
      }

      await queryInterface.bulkInsert('directory_fields', directoryFields, {});

      console.log('Directory fields created successfully!');
      console.log(`Total directory fields created: ${directoryFields.length}`);

    } catch (error) {
      console.error('Error creating directory fields:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing directory fields...');
      
      // Get directories that are linked to Uzbek companies through company_directories
      const uzbekDirectoryIds = await queryInterface.sequelize.query(
        'SELECT d.id FROM directories d JOIN company_directories cd ON d.id = cd.directory_id JOIN companies c ON cd.company_id = c.id WHERE c.name LIKE \'%Uzbek%\' OR c.name LIKE \'%Tashkent%\' OR c.name LIKE \'%Samarkand%\' OR c.name LIKE \'%Bukhara%\' OR c.name LIKE \'%Andijan%\' OR c.name LIKE \'%Fergana%\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (uzbekDirectoryIds.length > 0) {
        const directoryIds = uzbekDirectoryIds.map(d => d.id);
        
        // Remove directory fields
        await queryInterface.bulkDelete('directory_fields', {
          directory_id: directoryIds
        }, {});
      }

      console.log('Directory fields removed successfully!');
    } catch (error) {
      console.error('Error removing directory fields:', error);
      throw error;
    }
  }
}; 