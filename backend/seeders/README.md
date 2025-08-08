# Database Seeders

This directory contains database seeders for the ERP system.

## Current Seeders

### Production Seed (`20250101000000-production-seed.js`)

This seeder is designed for production environments and creates:

1. **Essential Modules**: All core system modules (Dashboard, Cashier, Inventory, etc.)
2. **Super Admin Role**: A role with `is_super_admin: true` and all system permissions
3. **Comprehensive Permissions**: All possible permissions for each module (view, create, update, delete, manage)
4. **Super Admin User**: A default super administrator with full system access

#### Super Admin Credentials
- **Email**: `admin@erp.com`
- **Password**: `admin123`

#### What it creates:
- 14 essential modules
- 5 user roles (super_admin, admin, manager, cashier, salesman)
- 70+ permissions (covering all modules and actions)
- 1 super admin user with all permissions assigned

### Development Seeders

#### 1. Uzbek Companies (`20250102000000-development-companies.js`)
Creates 5 realistic Uzbek companies with industry-specific data:
- **Tashkent Textile Group** (Textiles)
- **Samarkand Trading Company** (Trade)
- **Bukhara Agricultural Enterprise** (Agriculture)
- **Andijan Manufacturing Solutions** (Manufacturing)
- **Fergana Logistics Center** (Logistics)

Each company includes:
- Realistic Uzbek addresses and contact information
- Industry-appropriate employee counts
- Uzbek CEO names and company descriptions
- Proper tax IDs and registration numbers

#### 2. Development Users (`20250102000001-development-users.js`)
Creates 4-5 users per company with realistic Uzbek names:
- **Admin users**: Company administrators
- **Manager users**: Department managers
- **Cashier users**: Sales and payment operators
- **Salesman users**: Sales representatives

All users have:
- Authentic Uzbek first and last names
- Company-specific email addresses
- Default password: `password123`
- Appropriate role assignments

#### 3. Company Modules (`20250102000002-development-company-modules.js`)
Enables 3-5 modules per company based on industry:
- **Textiles**: Dashboard, Inventory, Sales, Reports, Settings
- **Trade**: Dashboard, Cashier, Sales, Reports, Settings
- **Agriculture**: Dashboard, Inventory, Accounting, Reports, Settings
- **Manufacturing**: Dashboard, Inventory, Purchases, Sales, Reports, Settings
- **Logistics**: Dashboard, Inventory, Sales, Reports, Settings

#### 4. Directories (`20250102000003-development-directories.js`)
Creates comprehensive directory structure for each company:

**System Directories** (3 per company):
- Tizim foydalanuvchilari (System Users)
- Tizim sozlamalari (System Settings)
- Tizim loglari (System Logs)

**Company Directories** (4 per company):
- Kompaniya xodimlari (Company Employees)
- Kompaniya mijozlari (Company Customers)
- Kompaniya tashkilotlari (Company Partners)
- Kompaniya loyihalari (Company Projects)

**Module Directories** (3-4 per enabled module):
- Dashboard: Widgets, Reports
- Cashier: Transactions, Cashiers, Settings
- Inventory: Goods, Warehouses, Inventory, Movements
- Sales: Sales, Orders, Reports
- Purchases: Purchases, Suppliers, Reports
- Accounting: Accounts, Financial Reports, Budget Plans
- Reports: Templates, Data

#### 5. Directory Records (`20250102000004-development-directory-records.js`)
Creates realistic Uzbekistan-related data for each directory:

**High-volume directories** (20+ records):
- **Tizim foydalanuvchilari**: 25 system users
- **Sotuvlar**: 22 sales records
- **Kassa operatsiyalari**: 30 cashier operations

**Standard directories** (8-18 records):
- **Kompaniya xodimlari**: 15 employees
- **Kompaniya mijozlari**: 12 customers
- **Tovar-moddiy boyliklar**: 18 inventory items
- **Omborlar**: 8 warehouses
- **Xaridlar**: 15 purchases
- **Buxgalteriya hisoblar**: 10 accounts

**Default directories** (3-5 records):
- All other directories get 3-5 default records

## Usage

### Using NPM Scripts (Recommended)

#### Production Environment
```bash
# From the backend directory
npm run seed:production
```

#### Development Environment
```bash
# From the backend directory
npm run seed:development
```

#### Undoing Seeds
```bash
# Undo production seeds
npm run seed:undo:production

# Undo development seeds (includes production)
npm run seed:undo:development
```

### Manual Commands

#### Running Production Seed Only

```bash
# From the backend directory
npx sequelize-cli db:seed --seed 20250101000000-production-seed.js
```

#### Running All Development Seeds

```bash
# From the backend directory
npx sequelize-cli db:seed --seed 20250101000000-production-seed.js
npx sequelize-cli db:seed --seed 20250102000000-development-companies.js
npx sequelize-cli db:seed --seed 20250102000001-development-users.js
npx sequelize-cli db:seed --seed 20250102000002-development-company-modules.js
npx sequelize-cli db:seed --seed 20250102000003-development-directories.js
npx sequelize-cli db:seed --seed 20250102000004-development-directory-records.js
```

#### Undoing Seeds

```bash
# Undo in reverse order
npx sequelize-cli db:seed:undo --seed 20250102000004-development-directory-records.js
npx sequelize-cli db:seed:undo --seed 20250102000003-development-directories.js
npx sequelize-cli db:seed:undo --seed 20250102000002-development-company-modules.js
npx sequelize-cli db:seed:undo --seed 20250102000001-development-users.js
npx sequelize-cli db:seed:undo --seed 20250102000000-development-companies.js
npx sequelize-cli db:seed:undo --seed 20250101000000-production-seed.js
```

## Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run seed:production` | Runs only production seed (super admin + modules + permissions) |
| `npm run seed:development` | Runs production seed + all development seeds (companies, users, modules, directories, records) |
| `npm run seed:undo:production` | Undoes production seed |
| `npm run seed:undo:development` | Undoes all development seeds + production seed |
| `npm run seed` | Runs all seeds (legacy command) |
| `npm run seed:undo` | Undoes all seeds (legacy command) |

## Data Summary

### Production Environment
- 1 super admin user
- 14 essential modules
- 5 user roles (super_admin, admin, manager, cashier, salesman)
- 70+ permissions
- Clean, minimal setup

### Development Environment
- **5 Uzbek companies** with realistic data
- **20-25 users** (4-5 per company)
- **15-25 enabled modules** (3-5 per company)
- **70-100 directories** (system, company, module types)
- **500+ directory records** with Uzbekistan-related data
- **20+ records** for high-volume directories (system users, sales, cashier operations)

## Security Notes

- The production seeder creates a super admin with default credentials
- **IMPORTANT**: Change the default password immediately after deployment
- The super admin has access to all system features and permissions
- Development users have default password: `password123`
- Consider implementing additional security measures for production environments

## Data Authenticity

All development data is designed to be realistic for Uzbekistan:
- Authentic Uzbek company names and locations
- Realistic Uzbek personal names
- Proper Uzbek phone numbers (+998 format)
- Industry-appropriate data and descriptions
- Uzbek currency (UZS) and realistic amounts
- Local business terminology and categories 