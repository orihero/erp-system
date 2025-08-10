'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();
      console.log('Creating directories for Uzbek companies...');

      // Get companies
      const companies = await queryInterface.sequelize.query(
        'SELECT id, name, industry FROM companies WHERE name LIKE \'%Uzbek%\' OR name LIKE \'%Tashkent%\' OR name LIKE \'%Samarkand%\' OR name LIKE \'%Bukhara%\' OR name LIKE \'%Andijan%\' OR name LIKE \'%Fergana%\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!companies || companies.length === 0) {
        throw new Error('No Uzbek companies found. Please run the companies seeder first.');
      }

      // Get modules
      const modules = await queryInterface.sequelize.query(
        'SELECT id, name FROM modules;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      const directories = [];
      const companyDirectories = [];

             // Define directory templates for different types
       const directoryTemplates = {
         system: [
           {
             name: 'Tizim foydalanuvchilari',
             icon_name: 'material-symbols:people',
             directory_type: 'System',
             metadata: JSON.stringify({
               category: 'users',
               description: 'Tizim foydalanuvchilari ro\'yxati'
             })
           },
           {
             name: 'Tizim sozlamalari',
             icon_name: 'material-symbols:settings',
             directory_type: 'System',
             metadata: JSON.stringify({
               category: 'settings',
               description: 'Tizim konfiguratsiyasi'
             })
           },
           {
             name: 'Tizim loglari',
             icon_name: 'material-symbols:history',
             directory_type: 'System',
             metadata: JSON.stringify({
               category: 'logs',
               description: 'Tizim faoliyati loglari'
             })
           }
         ],
         company: [
           {
             name: 'Kompaniya xodimlari',
             icon_name: 'material-symbols:badge',
             directory_type: 'Company',
             metadata: JSON.stringify({
               category: 'employees',
               description: 'Kompaniya xodimlari ma\'lumotlari'
             })
           },
           {
             name: 'Kompaniya mijozlari',
             icon_name: 'material-symbols:person',
             directory_type: 'Company',
             metadata: JSON.stringify({
               category: 'customers',
               description: 'Kompaniya mijozlari ro\'yxati'
             })
           },
           {
             name: 'Kompaniya tashkilotlari',
             icon_name: 'material-symbols:business',
             directory_type: 'Company',
             metadata: JSON.stringify({
               category: 'partners',
               description: 'Hamkor tashkilotlar'
             })
           },
           {
             name: 'Kompaniya loyihalari',
             icon_name: 'material-symbols:work',
             directory_type: 'Company',
             metadata: JSON.stringify({
               category: 'projects',
               description: 'Kompaniya loyihalari'
             })
           }
         ],
         module: {
           'Dashboard': [
             {
               name: 'Dashboard widgetlar',
               icon_name: 'material-symbols:dashboard',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'widgets',
                 description: 'Dashboard uchun widgetlar'
               })
             },
             {
               name: 'Dashboard hisobotlar',
               icon_name: 'material-symbols:assessment',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'reports',
                 description: 'Dashboard hisobotlari'
               })
             }
           ],
           'Cashier': [
             {
               name: 'Kassa operatsiyalari',
               icon_name: 'material-symbols:point-of-sale',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'transactions',
                 description: 'Kassa operatsiyalari tarixi'
               })
             },
             {
               name: 'Kassa xodimlari',
               icon_name: 'material-symbols:person',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'cashiers',
                 description: 'Kassa xodimlari ro\'yxati'
               })
             },
             {
               name: 'Kassa sozlamalari',
               icon_name: 'material-symbols:settings',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'settings',
                 description: 'Kassa konfiguratsiyasi'
               })
             }
           ],
           'Inventory': [
             {
               name: 'Tovar-moddiy boyliklar',
               icon_name: 'material-symbols:inventory',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'goods',
                 description: 'Tovar-moddiy boyliklar ro\'yxati'
               })
             },
             {
               name: 'Omborlar',
               icon_name: 'material-symbols:warehouse',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'warehouses',
                 description: 'Omborlar ro\'yxati'
               })
             },
             {
               name: 'Inventarizatsiya',
               icon_name: 'material-symbols:fact-check',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'inventory',
                 description: 'Inventarizatsiya hisobotlari'
               })
             },
             {
               name: 'Tovar harakatlari',
               icon_name: 'material-symbols:sync',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'movements',
                 description: 'Tovar harakatlari tarixi'
               })
             }
           ],
           'Sales': [
             {
               name: 'Sotuvlar',
               icon_name: 'material-symbols:store',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'sales',
                 description: 'Sotuvlar tarixi'
               })
             },
             {
               name: 'Buyurtmalar',
               icon_name: 'material-symbols:shopping-cart',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'orders',
                 description: 'Mijoz buyurtmalari'
               })
             },
             {
               name: 'Sotuv hisobotlari',
               icon_name: 'material-symbols:assessment',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'reports',
                 description: 'Sotuv hisobotlari'
               })
             }
           ],
           'Purchases': [
             {
               name: 'Xaridlar',
               icon_name: 'material-symbols:shopping-cart',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'purchases',
                 description: 'Xaridlar tarixi'
               })
             },
             {
               name: 'Yetkazib beruvchilar',
               icon_name: 'material-symbols:local-shipping',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'suppliers',
                 description: 'Yetkazib beruvchilar ro\'yxati'
               })
             },
             {
               name: 'Xarid hisobotlari',
               icon_name: 'material-symbols:assessment',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'reports',
                 description: 'Xarid hisobotlari'
               })
             }
           ],
           'Accounting': [
             {
               name: 'Buxgalteriya hisoblar',
               icon_name: 'material-symbols:account-balance',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'accounts',
                 description: 'Buxgalteriya hisoblar'
               })
             },
             {
               name: 'Moliyaviy hisobotlar',
               icon_name: 'material-symbols:assessment',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'financial',
                 description: 'Moliyaviy hisobotlar'
               })
             },
             {
               name: 'Byudjet rejalari',
               icon_name: 'material-symbols:account-balance-wallet',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'budget',
                 description: 'Byudjet rejalari'
               })
             }
           ],
           'Reports': [
             {
               name: 'Hisobot shablonlari',
               icon_name: 'material-symbols:description',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'templates',
                 description: 'Hisobot shablonlari'
               })
             },
             {
               name: 'Hisobot ma\'lumotlari',
               icon_name: 'material-symbols:data-usage',
               directory_type: 'Module',
               metadata: JSON.stringify({
                 category: 'data',
                 description: 'Hisobot ma\'lumotlari'
               })
             }
           ]
         }
       };

                   for (const company of companies) {
        // Create system directories for each company
        directoryTemplates.system.forEach(template => {
          const directoryId = uuidv4();
          directories.push({
            id: directoryId,
            name: template.name,
            icon_name: template.icon_name,
            directory_type: template.directory_type,
            metadata: template.metadata,
            created_at: now,
            updated_at: now
          });
          
          // Create company_directories entry
          companyDirectories.push({
            id: uuidv4(),
            company_id: company.id,
            directory_id: directoryId,
            created_at: now,
            updated_at: now
          });
        });

        // Create company directories for each company
        directoryTemplates.company.forEach(template => {
          const directoryId = uuidv4();
          directories.push({
            id: directoryId,
            name: template.name,
            icon_name: template.icon_name,
            directory_type: template.directory_type,
            metadata: template.metadata,
            created_at: now,
            updated_at: now
          });
          
          // Create company_directories entry
          companyDirectories.push({
            id: uuidv4(),
            company_id: company.id,
            directory_id: directoryId,
            created_at: now,
            updated_at: now
          });
        });

        // Get enabled modules for this company
        const companyModules = await queryInterface.sequelize.query(
          'SELECT m.id, m.name FROM modules m JOIN company_modules cm ON m.id = cm.module_id WHERE cm.company_id = ? AND cm.is_enabled = true;',
          { 
            replacements: [company.id],
            type: queryInterface.sequelize.QueryTypes.SELECT 
          }
        );

        // Create module directories for enabled modules
        companyModules.forEach(module => {
          const moduleDirectories = directoryTemplates.module[module.name] || [];
          moduleDirectories.forEach(template => {
            const directoryId = uuidv4();
            directories.push({
              id: directoryId,
              name: template.name,
              icon_name: template.icon_name,
              directory_type: template.directory_type,
              metadata: template.metadata,
              created_at: now,
              updated_at: now
            });
            
            // Create company_directories entry
            companyDirectories.push({
              id: uuidv4(),
              company_id: company.id,
              directory_id: directoryId,
              created_at: now,
              updated_at: now
            });
          });
        });

        console.log(`Created directories for ${company.name}: ${directoryTemplates.system.length} system + ${directoryTemplates.company.length} company + ${companyModules.length * 3} module directories`);
      }

      await queryInterface.bulkInsert('directories', directories, {});
      
      // Insert company_directories entries
      await queryInterface.bulkInsert('company_directories', companyDirectories, {});

      console.log('Directories created successfully!');
      console.log(`Total directories created: ${directories.length}`);
      console.log(`Total company-directory assignments: ${companyDirectories.length}`);

    } catch (error) {
      console.error('Error creating directories:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing directories...');
      
      // Get directories that are linked to Uzbek companies through company_directories
      const uzbekDirectoryIds = await queryInterface.sequelize.query(
        'SELECT d.id FROM directories d JOIN company_directories cd ON d.id = cd.directory_id JOIN companies c ON cd.company_id = c.id WHERE c.name LIKE \'%Uzbek%\' OR c.name LIKE \'%Tashkent%\' OR c.name LIKE \'%Samarkand%\' OR c.name LIKE \'%Bukhara%\' OR c.name LIKE \'%Andijan%\' OR c.name LIKE \'%Fergana%\';',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (uzbekDirectoryIds.length > 0) {
        const directoryIds = uzbekDirectoryIds.map(d => d.id);
        
        // Remove company_directories first
        await queryInterface.sequelize.query(
          'DELETE FROM company_directories WHERE directory_id IN (?);',
          { replacements: [directoryIds] }
        );
        
        // Then remove directories
        await queryInterface.bulkDelete('directories', {
          id: directoryIds
        }, {});
      }

      console.log('Directories removed successfully!');
    } catch (error) {
      console.error('Error removing directories:', error);
      throw error;
    }
  }
}; 