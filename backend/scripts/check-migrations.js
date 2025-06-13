/**
 * Migration Validation Script
 * 
 * This script checks for common issues in migration files:
 * 1. Missing down methods
 * 2. Inconsistent table naming (snake_case vs. camelCase/PascalCase)
 * 3. ENUM types that aren't properly cleaned up
 * 4. Missing index removals in down methods
 * 5. Proper error handling
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// Helper function to check if a string is snake_case
function isSnakeCase(str) {
  return /^[a-z]+(_[a-z]+)*$/.test(str);
}

// Helper function to extract table names from migration content
function extractTableNames(content) {
  const createTableRegex = /createTable\s*\(\s*['"]([^'"]+)['"]/g;
  const tableNames = [];
  let match;
  
  while ((match = createTableRegex.exec(content)) !== null) {
    tableNames.push(match[1]);
  }
  
  return tableNames;
}

// Helper function to check if ENUM types are properly handled
function checkEnumHandling(content) {
  const hasEnum = content.includes('Sequelize.ENUM') || content.includes('DataTypes.ENUM');
  const hasEnumDrop = content.includes('DROP TYPE IF EXISTS') || 
                      content.includes('queryInterface.sequelize.query') && 
                      content.includes('enum_');
  
  return {
    hasEnum,
    hasEnumDrop
  };
}

// Helper function to check if indexes are properly handled
function checkIndexHandling(content) {
  const addIndexRegex = /addIndex\s*\(\s*['"]([^'"]+)['"]/g;
  const removeIndexRegex = /removeIndex\s*\(\s*['"]([^'"]+)['"]/g;
  
  const addedIndexes = [];
  const removedIndexes = [];
  
  let match;
  while ((match = addIndexRegex.exec(content)) !== null) {
    addedIndexes.push(match[1]);
  }
  
  while ((match = removeIndexRegex.exec(content)) !== null) {
    removedIndexes.push(match[1]);
  }
  
  return {
    addedIndexes,
    removedIndexes
  };
}

// Main validation function
function validateMigrations() {
  console.log('Checking migration files for potential issues...');
  
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.js'))
    .sort();
  
  let hasIssues = false;
  
  migrationFiles.forEach(file => {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\nChecking ${file}...`);
    
    // Check for missing down method
    if (!content.includes('down: async') && !content.includes('async down')) {
      console.error('❌ Missing down method');
      hasIssues = true;
    }
    
    // Check table naming conventions
    const tableNames = extractTableNames(content);
    tableNames.forEach(tableName => {
      if (!isSnakeCase(tableName)) {
        console.error(`❌ Table name "${tableName}" is not in snake_case`);
        hasIssues = true;
      }
    });
    
    // Check ENUM handling
    const { hasEnum, hasEnumDrop } = checkEnumHandling(content);
    if (hasEnum && !hasEnumDrop) {
      console.warn('⚠️ ENUM type is used but no DROP TYPE statement found in down method');
      hasIssues = true;
    }
    
    // Check index handling
    const { addedIndexes, removedIndexes } = checkIndexHandling(content);
    if (addedIndexes.length > removedIndexes.length) {
      console.warn('⚠️ Some indexes are added but not explicitly removed in down method');
      hasIssues = true;
    }
    
    // Check for error handling in down method
    if (!content.includes('try') || !content.includes('catch')) {
      console.warn('⚠️ No error handling (try/catch) found in migration');
    }
    
    if (!hasIssues) {
      console.log('✅ No issues found');
    }
  });
  
  return hasIssues;
}

// Run the validation
const hasIssues = validateMigrations();

if (hasIssues) {
  console.log('\n⚠️ Issues were found in migration files that might cause problems during rollback.');
  console.log('Please review and fix these issues before running db:migrate:undo:all');
} else {
  console.log('\n✅ All migration files look good!');
}
