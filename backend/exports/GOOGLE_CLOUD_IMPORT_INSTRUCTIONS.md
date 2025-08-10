# Google Cloud Database Import Instructions

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
4. Upload `full_database_dump.sql`
5. Select "SQL" as import type
6. Click "Import"

### Option 2: Import Schema First, Then Data
1. Import `schema.sql` first to create the structure
2. Import individual CSV files for each table
3. Use Google Cloud Console > SQL > Import > CSV option

### Option 3: Manual Migration
1. Review `migrations.sql` for migration structure
2. Convert JavaScript migrations to SQL manually
3. Import the converted SQL files

## Important Notes

- Ensure your Google Cloud PostgreSQL instance has the same version or higher
- Check that all required extensions are enabled
- Verify character encoding (UTF-8) is properly set
- Test import on a development instance first

## Database Configuration

- Database Name: erp_db
- Host: 127.0.0.1
- Port: 5432
- Dialect: postgres

## Tables Included

- companies
- users
- modules
- company_modules
- directories
- directory_fields
- directory_values
- directory_records
- permissions
- roles
- role_permissions
- user_role_assignments
- receipts
- report_structures
- report_template_versions
- report_template_bindings
- report_execution_history

## Next Steps

1. Review the exported files
2. Test import on a development environment
3. Update your application's database configuration
4. Update connection strings in your application
