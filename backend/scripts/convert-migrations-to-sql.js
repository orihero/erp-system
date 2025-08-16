require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Create a mock Sequelize instance for migration conversion
const mockSequelize = new Sequelize('mock', 'mock', 'mock', {
  dialect: 'postgres',
  logging: false
});

// Mock queryInterface for migration conversion
const mockQueryInterface = {
  createTable: (tableName, attributes, options = {}) => {
    let sql = `CREATE TABLE "${tableName}" (\n`;
    const columns = [];
    
    for (const [columnName, columnDef] of Object.entries(attributes)) {
      let columnSQL = `  "${columnName}" `;
      
      // Convert Sequelize types to PostgreSQL types
      if (columnDef.type instanceof DataTypes.UUID) {
        columnSQL += 'UUID';
        if (columnDef.defaultValue === DataTypes.UUIDV4) {
          columnSQL += ` DEFAULT '${uuidv4()}'`;
        }
      } else if (columnDef.type instanceof DataTypes.STRING) {
        columnSQL += `VARCHAR(${columnDef.type._length || 255})`;
      } else if (columnDef.type instanceof DataTypes.TEXT) {
        columnSQL += 'TEXT';
      } else if (columnDef.type instanceof DataTypes.INTEGER) {
        columnSQL += 'INTEGER';
      } else if (columnDef.type instanceof DataTypes.BIGINT) {
        columnSQL += 'BIGINT';
      } else if (columnDef.type instanceof DataTypes.FLOAT) {
        columnSQL += 'FLOAT';
      } else if (columnDef.type instanceof DataTypes.DECIMAL) {
        columnSQL += `DECIMAL(${columnDef.type._precision || 10}, ${columnDef.type._scale || 0})`;
      } else if (columnDef.type instanceof DataTypes.BOOLEAN) {
        columnSQL += 'BOOLEAN';
      } else if (columnDef.type instanceof DataTypes.DATE) {
        columnSQL += 'TIMESTAMP';
      } else if (columnDef.type instanceof DataTypes.DATEONLY) {
        columnSQL += 'DATE';
      } else if (columnDef.type instanceof DataTypes.TIME) {
        columnSQL += 'TIME';
      } else if (columnDef.type instanceof DataTypes.JSON) {
        columnSQL += 'JSON';
      } else if (columnDef.type instanceof DataTypes.JSONB) {
        columnSQL += 'JSONB';
      } else if (columnDef.type instanceof DataTypes.ENUM) {
        const enumValues = columnDef.type._values.map(v => `'${v}'`).join(', ');
        columnSQL += `ENUM(${enumValues})`;
      } else {
        columnSQL += 'TEXT'; // fallback
      }
      
      // Add constraints
      if (columnDef.allowNull === false) {
        columnSQL += ' NOT NULL';
      }
      
      if (columnDef.primaryKey) {
        columnSQL += ' PRIMARY KEY';
      }
      
      if (columnDef.unique) {
        columnSQL += ' UNIQUE';
      }
      
      if (columnDef.defaultValue !== undefined && columnDef.defaultValue !== DataTypes.UUIDV4) {
        if (typeof columnDef.defaultValue === 'string') {
          columnSQL += ` DEFAULT '${columnDef.defaultValue}'`;
        } else if (columnDef.defaultValue === Sequelize.NOW) {
          columnSQL += ' DEFAULT CURRENT_TIMESTAMP';
        } else {
          columnSQL += ` DEFAULT ${columnDef.defaultValue}`;
        }
      }
      
      columns.push(columnSQL);
    }
    
    sql += columns.join(',\n') + '\n)';
    
    // Add table options
    if (options.charset) {
      sql += `;\n-- Note: Charset ${options.charset} should be set at database level`;
    }
    
    return sql + ';';
  },
  
  addColumn: (tableName, columnName, columnDef) => {
    let sql = `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" `;
    
    if (columnDef.type instanceof DataTypes.UUID) {
      sql += 'UUID';
    } else if (columnDef.type instanceof DataTypes.STRING) {
      sql += `VARCHAR(${columnDef.type._length || 255})`;
    } else if (columnDef.type instanceof DataTypes.TEXT) {
      sql += 'TEXT';
    } else if (columnDef.type instanceof DataTypes.INTEGER) {
      sql += 'INTEGER';
    } else if (columnDef.type instanceof DataTypes.BOOLEAN) {
      sql += 'BOOLEAN';
    } else if (columnDef.type instanceof DataTypes.DATE) {
      sql += 'TIMESTAMP';
    } else if (columnDef.type instanceof DataTypes.JSONB) {
      sql += 'JSONB';
    } else {
      sql += 'TEXT';
    }
    
    if (columnDef.allowNull === false) {
      sql += ' NOT NULL';
    }
    
    if (columnDef.defaultValue !== undefined) {
      if (typeof columnDef.defaultValue === 'string') {
        sql += ` DEFAULT '${columnDef.defaultValue}'`;
      } else if (columnDef.defaultValue === Sequelize.NOW) {
        sql += ' DEFAULT CURRENT_TIMESTAMP';
      } else {
        sql += ` DEFAULT ${columnDef.defaultValue}`;
      }
    }
    
    return sql + ';';
  },
  
  addIndex: (tableName, indexName, fields, options = {}) => {
    const fieldNames = fields.map(field => `"${field}"`).join(', ');
    let sql = `CREATE INDEX "${indexName}" ON "${tableName}" (${fieldNames})`;
    
    if (options.unique) {
      sql = sql.replace('CREATE INDEX', 'CREATE UNIQUE INDEX');
    }
    
    return sql + ';';
  },
  
  addConstraint: (tableName, constraintName, constraint) => {
    if (constraint.type === 'foreign key') {
      const { fields, references } = constraint;
      const fieldName = Array.isArray(fields) ? fields[0] : fields;
      const referenceField = Array.isArray(references.fields) ? references.fields[0] : references.fields;
      
      return `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" FOREIGN KEY ("${fieldName}") REFERENCES "${references.table}" ("${referenceField}") ON DELETE ${constraint.onDelete || 'NO ACTION'} ON UPDATE ${constraint.onUpdate || 'NO ACTION'};`;
    }
    
    return `-- Constraint: ${constraintName} (${constraint.type})`;
  },
  
  changeColumn: (tableName, columnName, columnDef) => {
    let sql = `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE `;
    
    if (columnDef.type instanceof DataTypes.STRING) {
      sql += `VARCHAR(${columnDef.type._length || 255})`;
    } else if (columnDef.type instanceof DataTypes.TEXT) {
      sql += 'TEXT';
    } else if (columnDef.type instanceof DataTypes.INTEGER) {
      sql += 'INTEGER';
    } else if (columnDef.type instanceof DataTypes.BOOLEAN) {
      sql += 'BOOLEAN';
    } else {
      sql += 'TEXT';
    }
    
    return sql + ';';
  },
  
  removeColumn: (tableName, columnName) => {
    return `ALTER TABLE "${tableName}" DROP COLUMN "${columnName}";`;
  },
  
  removeIndex: (tableName, indexName) => {
    return `DROP INDEX IF EXISTS "${indexName}";`;
  },
  
  dropTable: (tableName) => {
    return `DROP TABLE IF EXISTS "${tableName}" CASCADE;`;
  }
};

// Function to convert a migration to SQL
function convertMigrationToSQL(migrationPath) {
  try {
    const migration = require(migrationPath);
    let sql = '';
    
    if (migration.up && typeof migration.up === 'function') {
      // Create a mock context for the migration
      const mockContext = {
        queryInterface: mockQueryInterface,
        Sequelize: Sequelize,
        DataTypes: DataTypes
      };
      
      // Execute the migration and capture SQL
      const originalLog = console.log;
      const sqlStatements = [];
      
      // Override console.log to capture SQL
      console.log = (msg) => {
        if (typeof msg === 'string' && msg.includes('CREATE') || msg.includes('ALTER') || msg.includes('DROP')) {
          sqlStatements.push(msg);
        }
      };
      
      try {
        // Execute the migration
        migration.up(mockQueryInterface, Sequelize);
      } catch (error) {
        // Migration might fail in mock environment, that's okay
        console.warn(`Warning: Migration execution failed in mock environment: ${error.message}`);
      }
      
      // Restore console.log
      console.log = originalLog;
      
      // Add captured SQL statements
      if (sqlStatements.length > 0) {
        sql += sqlStatements.join('\n') + '\n';
      }
    }
    
    return sql;
  } catch (error) {
    return `-- Error converting migration: ${error.message}\n`;
  }
}

// Main function to convert all migrations
async function convertAllMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const exportsDir = path.join(__dirname, '..', 'exports');
  
  // Create exports directory if it doesn't exist
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
  
  const outputFile = path.join(exportsDir, 'converted_migrations.sql');
  let allSQL = `-- Converted Sequelize Migrations to SQL\n`;
  allSQL += `-- Generated for Google Cloud Database Import\n`;
  allSQL += `-- Generated on: ${new Date().toISOString()}\n\n`;
  
  console.log('🔄 Converting Sequelize migrations to SQL...');
  
  // Read all migration files
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort(); // Sort to maintain order
  
  for (const file of migrationFiles) {
    console.log(`📝 Converting: ${file}`);
    const migrationPath = path.join(migrationsDir, file);
    
    allSQL += `-- Migration: ${file}\n`;
    allSQL += `-- ==========================================\n`;
    
    const migrationSQL = convertMigrationToSQL(migrationPath);
    if (migrationSQL.trim()) {
      allSQL += migrationSQL;
    } else {
      allSQL += `-- Note: This migration contains JavaScript code that needs manual conversion\n`;
      allSQL += `-- Review the original migration file: ${file}\n`;
    }
    
    allSQL += '\n';
  }
  
  // Write the converted SQL
  fs.writeFileSync(outputFile, allSQL);
  console.log(`✅ Converted migrations saved to: ${outputFile}`);
  
  return outputFile;
}

// Run the conversion
if (require.main === module) {
  convertAllMigrations()
    .then(() => {
      console.log('\n🎉 Migration conversion completed!');
      console.log('📋 Next steps:');
      console.log('1. Review the converted SQL file');
      console.log('2. Test the SQL on a local database first');
      console.log('3. Import to Google Cloud Database');
    })
    .catch(error => {
      console.error('❌ Conversion failed:', error);
      process.exit(1);
    });
}

module.exports = {
  convertAllMigrations,
  convertMigrationToSQL
};
