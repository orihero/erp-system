require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "erp_db",
  dialect: process.env.DB_DIALECT || "postgres"
};

// Create exports directory if it doesn't exist
const exportsDir = path.join(__dirname, '..', 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

console.log('🚀 Starting database export for Google Cloud...');
console.log(`📊 Database: ${dbConfig.database}`);
console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port || 5432}`);

// Function to execute shell commands with password handling
function executeCommand(command, usePassword = false) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Executing: ${command.replace(dbConfig.password, '***')}`);
    
    // If password is needed, set PGPASSWORD environment variable
    const env = usePassword ? { ...process.env, PGPASSWORD: dbConfig.password } : process.env;
    
    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️  Warning: ${stderr}`);
      }
      console.log(`✅ Success: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Export schema only (structure without data)
async function exportSchema() {
  const schemaFile = path.join(exportsDir, 'schema.sql');
  const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port || 5432} -U ${dbConfig.username} -d ${dbConfig.database} --schema-only --no-owner --no-privileges > "${schemaFile}"`;
  
  try {
    await executeCommand(command, true);
    console.log(`📋 Schema exported to: ${schemaFile}`);
    return schemaFile;
  } catch (error) {
    console.error('Failed to export schema:', error);
    throw error;
  }
}

// Export full database (schema + data)
async function exportFullDatabase() {
  const fullDumpFile = path.join(exportsDir, 'full_database_dump.sql');
  const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port || 5432} -U ${dbConfig.username} -d ${dbConfig.database} --no-owner --no-privileges > "${fullDumpFile}"`;
  
  try {
    await executeCommand(command, true);
    console.log(`💾 Full database exported to: ${fullDumpFile}`);
    return fullDumpFile;
  } catch (error) {
    console.error('Failed to export full database:', error);
    throw error;
  }
}

// Export individual tables as CSV
async function exportTablesAsCSV() {
  const tables = [
    'companies',
    'users', 
    'modules',
    'company_modules',
    'directories',
    'directory_fields',
    'directory_values',
    'directory_records',
    'permissions',
    'roles',
    'role_permissions',
    'user_role_assignments',
    'receipts',
    'report_structures',
    'report_template_versions',
    'report_template_bindings',
    'report_execution_history'
  ];

  console.log('\n📊 Exporting tables as CSV...');
  
  for (const table of tables) {
    const csvFile = path.join(exportsDir, `${table}.csv`);
    const command = `psql -h ${dbConfig.host} -p ${dbConfig.port || 5432} -U ${dbConfig.username} -d ${dbConfig.database} -c "\\COPY ${table} TO '${csvFile}' WITH CSV HEADER;"`;
    
    try {
      await executeCommand(command, true);
      console.log(`✅ ${table} exported to: ${csvFile}`);
    } catch (error) {
      console.warn(`⚠️  Failed to export ${table}: ${error.message}`);
    }
  }
}

// Generate migration SQL from Sequelize migrations
async function generateMigrationSQL() {
  const migrationSQLFile = path.join(exportsDir, 'migrations.sql');
  let migrationSQL = '';
  
  console.log('\n🔄 Generating SQL from migrations...');
  
  // Read all migration files and extract SQL
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort(); // Sort to maintain order
  
  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    const migration = require(migrationPath);
    
    if (migration.up && typeof migration.up === 'function') {
      // This is a simplified approach - in practice, you'd need to run the migrations
      // and capture the SQL they generate
      migrationSQL += `-- Migration: ${file}\n`;
      migrationSQL += `-- Note: This migration file contains JavaScript code\n`;
      migrationSQL += `-- You may need to manually convert the up() function to SQL\n\n`;
    }
  }
  
  fs.writeFileSync(migrationSQLFile, migrationSQL);
  console.log(`📝 Migration SQL template created: ${migrationSQLFile}`);
  return migrationSQLFile;
}

// Create import instructions
function createImportInstructions() {
  const instructionsFile = path.join(exportsDir, 'GOOGLE_CLOUD_IMPORT_INSTRUCTIONS.md');
  const instructions = `# Google Cloud Database Import Instructions

## Files Generated

1. **schema.sql** - Database structure only (tables, indexes, constraints)
2. **full_database_dump.sql** - Complete database with data
3. **migrations.sql** - Template for migration SQL (needs manual conversion)
4. ***.csv** - Individual table data in CSV format

## Import Options

### Option 1: Import Full Database Dump (Recommended)
1. Go to Google Cloud Console > SQL
2. Select your PostgreSQL instance
3. Go to "Import" tab
4. Upload \`full_database_dump.sql\`
5. Select "SQL" as import type
6. Click "Import"

### Option 2: Import Schema First, Then Data
1. Import \`schema.sql\` first to create the structure
2. Import individual CSV files for each table
3. Use Google Cloud Console > SQL > Import > CSV option

### Option 3: Manual Migration
1. Review \`migrations.sql\` for migration structure
2. Convert JavaScript migrations to SQL manually
3. Import the converted SQL files

## Important Notes

- Ensure your Google Cloud PostgreSQL instance has the same version or higher
- Check that all required extensions are enabled
- Verify character encoding (UTF-8) is properly set
- Test import on a development instance first

## Database Configuration

- Database Name: ${dbConfig.database}
- Host: ${dbConfig.host}
- Port: ${dbConfig.port || 5432}
- Dialect: ${dbConfig.dialect}

## Tables Included

${[
  'companies', 'users', 'modules', 'company_modules', 'directories',
  'directory_fields', 'directory_values', 'directory_records', 'permissions',
  'roles', 'role_permissions', 'user_role_assignments', 'receipts',
  'report_structures', 'report_template_versions', 'report_template_bindings',
  'report_execution_history'
].map(table => `- ${table}`).join('\n')}

## Next Steps

1. Review the exported files
2. Test import on a development environment
3. Update your application's database configuration
4. Update connection strings in your application
`;

  fs.writeFileSync(instructionsFile, instructions);
  console.log(`📖 Import instructions created: ${instructionsFile}`);
  return instructionsFile;
}

// Main execution
async function main() {
  try {
    console.log('🔐 Using database password from config (no prompts needed)');
    
    // Export schema
    await exportSchema();
    
    // Export full database
    await exportFullDatabase();
    
    // Export tables as CSV
    await exportTablesAsCSV();
    
    // Generate migration SQL template
    await generateMigrationSQL();
    
    // Create import instructions
    createImportInstructions();
    
    console.log('\n🎉 Export completed successfully!');
    console.log(`📁 All files saved to: ${exportsDir}`);
    console.log('\n📋 Next steps:');
    console.log('1. Review the exported files');
    console.log('2. Follow the instructions in GOOGLE_CLOUD_IMPORT_INSTRUCTIONS.md');
    console.log('3. Test import on Google Cloud');
    
  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  exportSchema,
  exportFullDatabase,
  exportTablesAsCSV,
  generateMigrationSQL,
  createImportInstructions
};
