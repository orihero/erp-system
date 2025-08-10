# Cascading Field Selector Implementation

## Overview

The cascading field selector is a dynamic form component that shows additional fields based on the selection of a parent field. This implementation allows for complex form flows where selecting one option reveals additional related options.

## Architecture

### Database Schema

#### 1. DirectoryRecord Metadata
- Added `metadata` JSONB column to `directory_records` table
- Stores cascading configuration and parent field information

#### 2. Cascading Directories
Created new directories for cascading selections:
- **Payment Types Directory**: Different payment types (delivery, raw materials, salary)
- **Inventory Directory**: Inventory items for raw materials
- **Raw Materials Directory**: Specific raw materials by inventory
- **Departments Directory**: Company departments
- **Employees Directory**: Employees organized by departments

### Backend Implementation

#### 1. Models
- **DirectoryRecord**: Enhanced with metadata field and helper methods for cascading
- **DirectoryValue**: Simplified to store only field values without metadata
- **CascadingController**: Handles cascading logic and API endpoints

#### 2. API Endpoints
- `GET /api/cascading/config` - Get cascading configuration for a field value
- `GET /api/cascading/filtered-records` - Get filtered records based on parent value
- `GET /api/cascading/directories` - Get all cascading directories
- `PUT /api/cascading/config/:recordId` - Update cascading configuration
- `POST /api/cascading/validate` - Validate cascading selections
- `POST /api/cascading/save-values` - Save cascading field values
- `GET /api/cascading/values/:recordId` - Get cascading field values for a record

#### 3. Cascading Logic
```javascript
// Example cascading configuration in DirectoryRecord metadata
{
  "value": "buying_raw_material",
  "name": "Buying Raw Material",
  "cascadingConfig": {
    "enabled": true,
    "dependentFields": [
      {
        "fieldName": "inventory",
        "directoryId": "inventory-directory-id",
        "displayName": "Select Inventory",
        "required": true,
        "dependsOn": null
      },
      {
        "fieldName": "raw_material",
        "directoryId": "raw-materials-directory-id",
        "displayName": "Select Raw Material",
        "required": true,
        "dependsOn": "inventory"
      }
    ]
  }
}
```

#### 4. DirectoryRecord Helper Methods
```javascript
// Get cascading configuration
getCascadingConfig() {
  return this.metadata?.cascadingConfig || null;
}

// Check if cascading is enabled
isCascadingEnabled() {
  const config = this.getCascadingConfig();
  return config?.enabled || false;
}

// Get dependent fields
getDependentFields() {
  const config = this.getCascadingConfig();
  return config?.dependentFields || [];
}

// Get parent field value
getParentFieldValue() {
  return this.metadata?.parentFieldValue || null;
}

// Get parent field ID
getParentFieldId() {
  return this.metadata?.parentFieldId || null;
}
```

### Frontend Implementation

#### 1. CascadingFieldSelector Component
The main component that handles cascading field selection:

```typescript
interface CascadingConfig {
  enabled: boolean;
  dependentFields: CascadingField[];
}

interface CascadingField {
  fieldName: string;
  directoryId: string;
  displayName: string;
  required: boolean;
  dependsOn: string | null;
}
```

#### 2. Key Features
- **Dynamic Field Loading**: Fields appear based on parent selection
- **Validation**: Ensures selections are valid for parent values
- **Dependency Management**: Handles complex field dependencies
- **Data Persistence**: Saves cascading selections to database

### Database Schema Changes

#### 1. DirectoryRecord Table
```sql
ALTER TABLE directory_records 
ADD COLUMN metadata JSONB DEFAULT '{}';

-- Example metadata structure:
{
  "value": "buying_raw_material",
  "name": "Buying Raw Material",
  "cascadingConfig": {
    "enabled": true,
    "dependentFields": [...]
  },
  "parentFieldId": "field-uuid",
  "parentFieldValue": "selected-value",
  "isCascadingRecord": true
}
```

#### 2. DirectoryValue Table
```sql
-- Removed metadata column from directory_values
-- Values are now stored without metadata
```

### Usage Examples

#### 1. Creating a Cascading Record
```javascript
// Create a directory record with cascading configuration
const record = await DirectoryRecord.create({
  company_directory_id: companyDirectoryId,
  metadata: {
    parentFieldId: parentFieldId,
    parentFieldValue: parentValue,
    cascadingConfig: cascadingConfig,
    isCascadingRecord: true
  }
});

// Create directory values for the record
await DirectoryValue.create({
  directory_record_id: record.id,
  field_id: parentFieldId,
  value: parentValue
});
```

#### 2. Retrieving Cascading Data
```javascript
// Get cascading configuration
const config = await cascadingController.getCascadingConfig({
  directoryId: 'payment-types-directory',
  fieldId: 'payment-type-field',
  value: 'buying_raw_material'
});

// Get filtered records based on parent value
const records = await cascadingController.getFilteredRecords({
  directoryId: 'raw-materials-directory',
  parentField: 'inventory',
  parentValue: 'electronics'
});
```

### Migration and Seeding

#### 1. Run Migrations
```bash
# Add metadata to directory_records
npm run migrate

# Seed cascading data
npm run seed
```

#### 2. Seeded Data Structure
```
Payment Types Directory:
├── Delivery of Services (no cascading)
├── Buying Raw Material (cascading enabled)
│   ├── Inventory selection
│   └── Raw Material selection
└── Employee Salary (cascading enabled)
    ├── Department selection
    └── Employee selection
```

### Testing

#### 1. API Testing
Test the cascading endpoints:
- `GET /api/cascading/config?directoryId=...&fieldId=...&value=...`
- `GET /api/cascading/filtered-records?directoryId=...&parentField=...&parentValue=...`
- `POST /api/cascading/save-values`

#### 2. Frontend Testing
Test the CascadingFieldSelector component:
- Select parent field value
- Verify dependent fields appear
- Test field dependencies
- Validate selections

### Benefits of DirectoryRecord-based Implementation

1. **Better Data Organization**: Cascading configuration is stored at the record level
2. **Simplified DirectoryValue**: Values are stored without complex metadata
3. **Easier Querying**: Can query records directly for cascading configuration
4. **Better Performance**: Fewer joins needed for cascading operations
5. **Cleaner Architecture**: Clear separation between record metadata and field values

### Future Enhancements

1. **Dynamic Cascading Rules**: Allow runtime configuration of cascading rules
2. **Multi-level Cascading**: Support for more than 2 levels of cascading
3. **Conditional Cascading**: Complex conditions for when cascading should trigger
4. **Cascading Templates**: Predefined cascading configurations for common use cases 