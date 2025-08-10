# Excel Functions Module

This module provides Excel-like functions for data manipulation and analysis in the ERP system. It's designed to be easily extensible and supports all common Excel function categories.

## Overview

The Excel functions module is organized into categories that match Excel's function library:

- **Text Functions**: String manipulation and text processing
- **Math Functions**: Mathematical operations and calculations
- **Date Functions**: Date and time manipulation
- **Logical Functions**: Boolean operations and conditional logic
- **Lookup Functions**: Data lookup and reference operations
- **Statistical Functions**: Statistical analysis and aggregation

## Structure

### Core Interfaces

```typescript
interface ExcelFunction {
  name: string;           // Function name (e.g., "SUM", "CONCATENATE")
  category: string;       // Function category
  description: string;    // Human-readable description
  syntax: string;         // Function syntax
  parameters: FunctionParameter[];
  returnType: string;     // Expected return type
  examples: string[];     // Usage examples
  supportedTypes: string[]; // Supported field types
}

interface FunctionParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string | number | boolean | null;
}
```

### Function Categories

#### Text Functions
- `CONCATENATE` - Combines values from multiple columns
- `LEFT` - Extracts characters from the left of column values
- `RIGHT` - Extracts characters from the right of column values
- `MID` - Extracts substring from middle of column values
- `LEN` - Returns length of column values
- `UPPER` - Converts column values to uppercase
- `LOWER` - Converts column values to lowercase
- `PROPER` - Capitalizes first letter of each word in column values
- `TRIM` - Removes extra spaces from column values
- `SUBSTITUTE` - Replaces text in column values

#### Math Functions
- `SUM` - Adds numbers in a column
- `AVERAGE` - Calculates average of numbers in a column
- `COUNT` - Counts non-empty values in a column
- `MAX` - Returns maximum value in a column
- `MIN` - Returns minimum value in a column
- `ROUND` - Rounds numbers in a column to specified digits
- `ABS` - Returns absolute value of numbers in a column
- `MOD` - Returns remainder after division for values in a column

#### Date Functions
- `YEAR` - Extracts year from dates in a column
- `MONTH` - Extracts month from dates in a column
- `DAY` - Extracts day from dates in a column
- `HOUR` - Extracts hour from times in a column
- `MINUTE` - Extracts minute from times in a column
- `SECOND` - Extracts second from times in a column
- `TODAY` - Returns current date
- `NOW` - Returns current date and time
- `DATE` - Creates date from components

#### Logical Functions
- `IF` - Conditional logic based on column values
- `AND` - Logical AND for multiple column conditions
- `OR` - Logical OR for multiple column conditions
- `NOT` - Logical NOT for column conditions
- `ISBLANK` - Checks if values in a column are blank
- `ISNUMBER` - Checks if values in a column are numbers
- `ISTEXT` - Checks if values in a column are text

#### Lookup Functions
- `VLOOKUP` - Vertical lookup
- `HLOOKUP` - Horizontal lookup

#### Statistical Functions
- `COUNTIF` - Counts values in a column that meet criteria
- `SUMIF` - Sums values in a column that meet criteria
- `AVERAGEIF` - Averages values in a column that meet criteria

## Usage

### Basic Usage

```typescript
import { getFunctionsByFieldType, executeFunction } from '@/utils/excelFunctions';

// Get functions for a specific field type
const textFunctions = getFunctionsByFieldType('text');

// Execute a function with column name
const result = executeFunction('UPPER', ['name'], 'text');
```

### In Filter Configuration

```typescript
import { ALL_FUNCTIONS, FUNCTION_CATEGORIES } from '@/utils/excelFunctions';

// Get all available functions
const allFunctions = ALL_FUNCTIONS;

// Get functions by category
const textFunctions = FUNCTION_CATEGORIES.find(cat => cat.id === 'text')?.functions;
```

## Extending the Module

### Adding New Functions

To add a new function, follow these steps:

1. **Define the function** in the appropriate category array:

```typescript
// In TEXT_FUNCTIONS array
{
  name: 'REPLACE',
  category: 'Text',
  description: 'Replaces characters in values in a column',
  syntax: 'REPLACE(column_name, start_num, num_chars, new_text)',
  parameters: [
    { name: 'column_name', type: 'string', required: true, description: 'Name of the column to replace in' },
    { name: 'start_num', type: 'number', required: true, description: 'Starting position' },
    { name: 'num_chars', type: 'number', required: true, description: 'Number of characters' },
    { name: 'new_text', type: 'string', required: true, description: 'New text' }
  ],
  returnType: 'string',
  examples: ['REPLACE("name", 7, 5, "Excel")'],
  supportedTypes: ['text', 'string']
}
```

2. **Add to ALL_FUNCTIONS** array:

```typescript
export const ALL_FUNCTIONS: ExcelFunction[] = [
  ...TEXT_FUNCTIONS,
  ...NUMERIC_FUNCTIONS,
  // ... other categories
];
```

3. **Implement the execution logic** in the `executeFunction` function:

```typescript
export const executeFunction = (functionName: string, params: (string | number | boolean)[], fieldType: string): string | number | boolean => {
  switch (functionName) {
    case 'REPLACE':
      const [columnName, startNum, numChars, newText] = params;
      // Implementation would work with column data
      return `REPLACE(${columnName}, ${startNum}, ${numChars}, "${newText}")`;
    // ... other cases
  }
};
```

### Adding New Categories

To add a new function category:

1. **Create the category array**:

```typescript
export const FINANCIAL_FUNCTIONS: ExcelFunction[] = [
  {
    name: 'PMT',
    category: 'Financial',
    description: 'Calculates loan payment',
    syntax: 'PMT(rate, nper, pv)',
    parameters: [
      { name: 'rate', type: 'number', required: true, description: 'Interest rate' },
      { name: 'nper', type: 'number', required: true, description: 'Number of periods' },
      { name: 'pv', type: 'number', required: true, description: 'Present value' }
    ],
    returnType: 'number',
    examples: ['PMT(0.05, 12, 10000)'],
    supportedTypes: ['decimal', 'number']
  }
];
```

2. **Add to ALL_FUNCTIONS**:

```typescript
export const ALL_FUNCTIONS: ExcelFunction[] = [
  ...TEXT_FUNCTIONS,
  ...NUMERIC_FUNCTIONS,
  ...FINANCIAL_FUNCTIONS, // Add new category
  // ... other categories
];
```

3. **Add to FUNCTION_CATEGORIES**:

```typescript
export const FUNCTION_CATEGORIES = [
  { id: 'text', name: 'Text Functions', functions: TEXT_FUNCTIONS },
  { id: 'financial', name: 'Financial Functions', functions: FINANCIAL_FUNCTIONS }, // Add new category
  // ... other categories
];
```

## Field Type Support

Functions specify which field types they support through the `supportedTypes` array:

- `'*'` - Supports all field types
- `'text'` - Text fields only
- `'integer'` - Integer fields only
- `'decimal'` - Decimal/number fields only
- `'date'` - Date fields only
- `'datetime'` - DateTime fields only
- `'time'` - Time fields only

## Integration with InsertWizard

The Excel functions are integrated into the InsertWizard's filter system:

1. **Filterable Fields**: Only fields with `isFilterable: true` in metadata are shown
2. **Function Selection**: Users can select Excel functions to apply to filterable fields
3. **Parameter Configuration**: Function parameters are configurable through a dialog
4. **Filter Application**: Functions are applied to create complex filter conditions

## Best Practices

1. **Function Naming**: Use UPPERCASE for function names to match Excel conventions
2. **Parameter Validation**: Always validate parameter types and ranges
3. **Error Handling**: Provide meaningful error messages for invalid inputs
4. **Documentation**: Include clear descriptions and examples for each function
5. **Testing**: Test functions with various input types and edge cases

## Future Enhancements

- **Function Chaining**: Support for nested function calls
- **Custom Functions**: Allow users to define custom functions
- **Function Templates**: Pre-built function combinations for common use cases
- **Performance Optimization**: Caching and optimization for complex calculations
- **Real-time Preview**: Live preview of function results in the UI 