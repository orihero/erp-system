// Excel Functions Module
// This module provides Excel-like functions for data manipulation and analysis

export interface ExcelFunction {
  name: string;
  category: string;
  description: string;
  syntax: string;
  parameters: FunctionParameter[];
  returnType: string;
  examples: string[];
  supportedTypes: string[];
}

export interface FunctionParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string | number | boolean | null;
}

export interface FilterCondition {
  field: string;
  operator: string;
  value: string | number | boolean | null;
  function?: string;
  functionParams?: (string | number | boolean)[];
}

// ===== TEXT FUNCTIONS =====
export const TEXT_FUNCTIONS: ExcelFunction[] = [
  {
    name: 'CONCATENATE',
    category: 'Text',
    description: 'Combines values from multiple columns into one string',
    syntax: 'CONCATENATE(column1, separator, column2, ...)',
    parameters: [
      { name: 'column1', type: 'string', required: true, description: 'First column to combine' },
      { name: 'separator', type: 'string', required: true, description: 'Separator between values' },
      { name: 'column2', type: 'string', required: false, description: 'Additional columns to combine' }
    ],
    returnType: 'string',
    examples: ['CONCATENATE("first_name", " ", "last_name")', 'CONCATENATE("name", " - ", "category")'],
    supportedTypes: ['text', 'string']
  },
  {
    name: 'LEFT',
    category: 'Text',
    description: 'Extracts a specified number of characters from the left side of values in a column',
    syntax: 'LEFT(column_name, num_chars)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to extract from' },
      { name: 'num_chars', type: 'number', required: true, description: 'Number of characters to extract' }
    ],
    returnType: 'string',
    examples: ['LEFT("name", 5)', 'LEFT("description", 10)'],
    supportedTypes: ['text', 'string']
  },
  {
    name: 'RIGHT',
    category: 'Text',
    description: 'Extracts a specified number of characters from the right side of values in a column',
    syntax: 'RIGHT(column_name, num_chars)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to extract from' },
      { name: 'num_chars', type: 'number', required: true, description: 'Number of characters to extract' }
    ],
    returnType: 'string',
    examples: ['RIGHT("name", 5)', 'RIGHT("description", 10)'],
    supportedTypes: ['text', 'string']
  },
  {
    name: 'MID',
    category: 'Text',
    description: 'Extracts a substring from the middle of values in a column',
    syntax: 'MID(column_name, start_num, num_chars)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to extract from' },
      { name: 'start_num', type: 'number', required: true, description: 'Starting position (1-based)' },
      { name: 'num_chars', type: 'number', required: true, description: 'Number of characters to extract' }
    ],
    returnType: 'string',
    examples: ['MID("name", 7, 5)', 'MID("description", 1, 10)'],
    supportedTypes: ['text', 'string']
  },
  {
    name: 'LEN',
    category: 'Text',
    description: 'Returns the length of values in a column',
    syntax: 'LEN(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to measure' }
    ],
    returnType: 'number',
    examples: ['LEN("name")', 'LEN("description")'],
    supportedTypes: ['text', 'string']
  },
  {
    name: 'UPPER',
    category: 'Text',
    description: 'Converts values in a column to uppercase',
    syntax: 'UPPER(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to convert' }
    ],
    returnType: 'string',
    examples: ['UPPER("name")', 'UPPER("description")'],
    supportedTypes: ['text', 'string']
  },
  {
    name: 'LOWER',
    category: 'Text',
    description: 'Converts values in a column to lowercase',
    syntax: 'LOWER(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to convert' }
    ],
    returnType: 'string',
    examples: ['LOWER("name")', 'LOWER("description")'],
    supportedTypes: ['text', 'string']
  },
  {
    name: 'PROPER',
    category: 'Text',
    description: 'Capitalizes the first letter of each word in values in a column',
    syntax: 'PROPER(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to convert' }
    ],
    returnType: 'string',
    examples: ['PROPER("name")', 'PROPER("description")'],
    supportedTypes: ['text', 'string']
  },
  {
    name: 'TRIM',
    category: 'Text',
    description: 'Removes extra spaces from values in a column',
    syntax: 'TRIM(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to clean' }
    ],
    returnType: 'string',
    examples: ['TRIM("name")', 'TRIM("description")'],
    supportedTypes: ['text', 'string']
  },
  {
    name: 'SUBSTITUTE',
    category: 'Text',
    description: 'Replaces text in values in a column',
    syntax: 'SUBSTITUTE(column_name, old_text, new_text, instance_num)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to search in' },
      { name: 'old_text', type: 'string', required: true, description: 'Text to replace' },
      { name: 'new_text', type: 'string', required: true, description: 'New text' },
      { name: 'instance_num', type: 'number', required: false, description: 'Which occurrence to replace', defaultValue: 1 }
    ],
    returnType: 'string',
    examples: ['SUBSTITUTE("name", "World", "Excel")', 'SUBSTITUTE("description", "old", "new")'],
    supportedTypes: ['text', 'string']
  }
];

// ===== NUMERIC FUNCTIONS =====
export const NUMERIC_FUNCTIONS: ExcelFunction[] = [
  {
    name: 'SUM',
    category: 'Math',
    description: 'Adds all numbers in a column',
    syntax: 'SUM(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to sum' }
    ],
    returnType: 'number',
    examples: ['SUM("amount")', 'SUM("price")'],
    supportedTypes: ['integer', 'decimal', 'number']
  },
  {
    name: 'AVERAGE',
    category: 'Math',
    description: 'Returns the average of numbers in a column',
    syntax: 'AVERAGE(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to average' }
    ],
    returnType: 'number',
    examples: ['AVERAGE("amount")', 'AVERAGE("price")'],
    supportedTypes: ['integer', 'decimal', 'number']
  },
  {
    name: 'COUNT',
    category: 'Math',
    description: 'Counts the number of non-empty values in a column',
    syntax: 'COUNT(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to count' }
    ],
    returnType: 'number',
    examples: ['COUNT("name")', 'COUNT("amount")'],
    supportedTypes: ['*']
  },
  {
    name: 'MAX',
    category: 'Math',
    description: 'Returns the largest value in a column',
    syntax: 'MAX(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to find maximum' }
    ],
    returnType: 'number',
    examples: ['MAX("amount")', 'MAX("price")'],
    supportedTypes: ['integer', 'decimal', 'number']
  },
  {
    name: 'MIN',
    category: 'Math',
    description: 'Returns the smallest value in a column',
    syntax: 'MIN(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to find minimum' }
    ],
    returnType: 'number',
    examples: ['MIN("amount")', 'MIN("price")'],
    supportedTypes: ['integer', 'decimal', 'number']
  },
  {
    name: 'ROUND',
    category: 'Math',
    description: 'Rounds values in a column to a specified number of digits',
    syntax: 'ROUND(column_name, num_digits)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to round' },
      { name: 'num_digits', type: 'number', required: true, description: 'Number of decimal places' }
    ],
    returnType: 'number',
    examples: ['ROUND("amount", 2)', 'ROUND("price", 0)'],
    supportedTypes: ['integer', 'decimal', 'number']
  },
  {
    name: 'ABS',
    category: 'Math',
    description: 'Returns the absolute value of numbers in a column',
    syntax: 'ABS(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to get absolute values' }
    ],
    returnType: 'number',
    examples: ['ABS("amount")', 'ABS("price")'],
    supportedTypes: ['integer', 'decimal', 'number']
  },
  {
    name: 'MOD',
    category: 'Math',
    description: 'Returns the remainder after division for values in a column',
    syntax: 'MOD(column_name, divisor)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to divide' },
      { name: 'divisor', type: 'number', required: true, description: 'Number to divide by' }
    ],
    returnType: 'number',
    examples: ['MOD("amount", 3)', 'MOD("price", 2)'],
    supportedTypes: ['integer', 'decimal', 'number']
  }
];

// ===== DATE FUNCTIONS =====
export const DATE_FUNCTIONS: ExcelFunction[] = [
  {
    name: 'YEAR',
    category: 'Date',
    description: 'Returns the year of dates in a column',
    syntax: 'YEAR(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column containing dates' }
    ],
    returnType: 'number',
    examples: ['YEAR("created_date")', 'YEAR("birth_date")'],
    supportedTypes: ['date', 'datetime']
  },
  {
    name: 'MONTH',
    category: 'Date',
    description: 'Returns the month of dates in a column (1-12)',
    syntax: 'MONTH(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column containing dates' }
    ],
    returnType: 'number',
    examples: ['MONTH("created_date")', 'MONTH("birth_date")'],
    supportedTypes: ['date', 'datetime']
  },
  {
    name: 'DAY',
    category: 'Date',
    description: 'Returns the day of dates in a column (1-31)',
    syntax: 'DAY(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column containing dates' }
    ],
    returnType: 'number',
    examples: ['DAY("created_date")', 'DAY("birth_date")'],
    supportedTypes: ['date', 'datetime']
  },
  {
    name: 'HOUR',
    category: 'Date',
    description: 'Returns the hour of times in a column (0-23)',
    syntax: 'HOUR(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column containing times' }
    ],
    returnType: 'number',
    examples: ['HOUR("created_time")', 'HOUR("start_time")'],
    supportedTypes: ['time', 'datetime']
  },
  {
    name: 'MINUTE',
    category: 'Date',
    description: 'Returns the minute of times in a column (0-59)',
    syntax: 'MINUTE(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column containing times' }
    ],
    returnType: 'number',
    examples: ['MINUTE("created_time")', 'MINUTE("start_time")'],
    supportedTypes: ['time', 'datetime']
  },
  {
    name: 'SECOND',
    category: 'Date',
    description: 'Returns the second of times in a column (0-59)',
    syntax: 'SECOND(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column containing times' }
    ],
    returnType: 'number',
    examples: ['SECOND("created_time")', 'SECOND("start_time")'],
    supportedTypes: ['time', 'datetime']
  },
  {
    name: 'TODAY',
    category: 'Date',
    description: 'Returns the current date',
    syntax: 'TODAY()',
    parameters: [],
    returnType: 'date',
    examples: ['TODAY()'],
    supportedTypes: ['date', 'datetime']
  },
  {
    name: 'NOW',
    category: 'Date',
    description: 'Returns the current date and time',
    syntax: 'NOW()',
    parameters: [],
    returnType: 'datetime',
    examples: ['NOW()'],
    supportedTypes: ['date', 'datetime']
  },
  {
    name: 'DATE',
    category: 'Date',
    description: 'Creates a date from year, month, and day',
    syntax: 'DATE(year, month, day)',
    parameters: [
      { name: 'year', type: 'number', required: true, description: 'Year (1900-9999)' },
      { name: 'month', type: 'number', required: true, description: 'Month (1-12)' },
      { name: 'day', type: 'number', required: true, description: 'Day (1-31)' }
    ],
    returnType: 'date',
    examples: ['DATE(2023, 12, 25)', 'DATE(A1, B1, C1)'],
    supportedTypes: ['date', 'datetime']
  }
];

// ===== LOGICAL FUNCTIONS =====
export const LOGICAL_FUNCTIONS: ExcelFunction[] = [
  {
    name: 'IF',
    category: 'Logical',
    description: 'Returns one value if a condition is true and another if it is false',
    syntax: 'IF(column_name, operator, value, value_if_true, value_if_false)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to test' },
      { name: 'operator', type: 'string', required: true, description: 'Comparison operator (>, <, =, !=, >=, <=)' },
      { name: 'value', type: 'string', required: true, description: 'Value to compare against' },
      { name: 'value_if_true', type: 'string', required: true, description: 'Value if condition is true' },
      { name: 'value_if_false', type: 'string', required: true, description: 'Value if condition is false' }
    ],
    returnType: 'string',
    examples: ['IF("amount", ">", "100", "High", "Low")', 'IF("status", "=", "active", "Valid", "Invalid")'],
    supportedTypes: ['*']
  },
  {
    name: 'AND',
    category: 'Logical',
    description: 'Returns TRUE if all conditions are TRUE for values in columns',
    syntax: 'AND(column1, operator1, value1, column2, operator2, value2, ...)',
    parameters: [
      { name: 'column1', type: 'string', required: true, description: 'First column to test' },
      { name: 'operator1', type: 'string', required: true, description: 'First comparison operator' },
      { name: 'value1', type: 'string', required: true, description: 'First value to compare against' },
      { name: 'column2', type: 'string', required: false, description: 'Second column to test' },
      { name: 'operator2', type: 'string', required: false, description: 'Second comparison operator' },
      { name: 'value2', type: 'string', required: false, description: 'Second value to compare against' }
    ],
    returnType: 'boolean',
    examples: ['AND("amount", ">", "0", "amount", "<", "100")', 'AND("status", "=", "active", "type", "=", "premium")'],
    supportedTypes: ['*']
  },
  {
    name: 'OR',
    category: 'Logical',
    description: 'Returns TRUE if any condition is TRUE for values in columns',
    syntax: 'OR(column1, operator1, value1, column2, operator2, value2, ...)',
    parameters: [
      { name: 'column1', type: 'string', required: true, description: 'First column to test' },
      { name: 'operator1', type: 'string', required: true, description: 'First comparison operator' },
      { name: 'value1', type: 'string', required: true, description: 'First value to compare against' },
      { name: 'column2', type: 'string', required: false, description: 'Second column to test' },
      { name: 'operator2', type: 'string', required: false, description: 'Second comparison operator' },
      { name: 'value2', type: 'string', required: false, description: 'Second value to compare against' }
    ],
    returnType: 'boolean',
    examples: ['OR("amount", ">", "100", "amount", "<", "0")', 'OR("status", "=", "active", "type", "=", "premium")'],
    supportedTypes: ['*']
  },
  {
    name: 'NOT',
    category: 'Logical',
    description: 'Reverses the logic of a condition for values in a column',
    syntax: 'NOT(column_name, operator, value)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to test' },
      { name: 'operator', type: 'string', required: true, description: 'Comparison operator' },
      { name: 'value', type: 'string', required: true, description: 'Value to compare against' }
    ],
    returnType: 'boolean',
    examples: ['NOT("amount", ">", "10")', 'NOT("status", "=", "active")'],
    supportedTypes: ['*']
  },
  {
    name: 'ISBLANK',
    category: 'Logical',
    description: 'Returns TRUE if values in a column are blank',
    syntax: 'ISBLANK(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to test' }
    ],
    returnType: 'boolean',
    examples: ['ISBLANK("name")', 'IF(ISBLANK("email"), "Empty", "Has Value")'],
    supportedTypes: ['*']
  },
  {
    name: 'ISNUMBER',
    category: 'Logical',
    description: 'Returns TRUE if values in a column are numbers',
    syntax: 'ISNUMBER(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to test' }
    ],
    returnType: 'boolean',
    examples: ['ISNUMBER("amount")', 'IF(ISNUMBER("price"), "Valid", "Not a number")'],
    supportedTypes: ['*']
  },
  {
    name: 'ISTEXT',
    category: 'Logical',
    description: 'Returns TRUE if values in a column are text',
    syntax: 'ISTEXT(column_name)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to test' }
    ],
    returnType: 'boolean',
    examples: ['ISTEXT("name")', 'IF(ISTEXT("description"), UPPER("description"), "description")'],
    supportedTypes: ['*']
  }
];

// ===== LOOKUP FUNCTIONS =====
export const LOOKUP_FUNCTIONS: ExcelFunction[] = [
  {
    name: 'VLOOKUP',
    category: 'Lookup',
    description: 'Looks up a value in the first column of a range and returns a value in the same row',
    syntax: 'VLOOKUP(lookup_value, table_array, col_index_num, range_lookup)',
    parameters: [
      { name: 'lookup_value', type: 'any', required: true, description: 'Value to search for' },
      { name: 'table_array', type: 'range', required: true, description: 'Range to search in' },
      { name: 'col_index_num', type: 'number', required: true, description: 'Column number to return' },
      { name: 'range_lookup', type: 'boolean', required: false, description: 'TRUE for approximate match, FALSE for exact', defaultValue: true }
    ],
    returnType: 'any',
    examples: ['VLOOKUP("Apple", A1:B10, 2, FALSE)', 'VLOOKUP(A1, B1:D10, 3, TRUE)'],
    supportedTypes: ['*']
  },
  {
    name: 'HLOOKUP',
    category: 'Lookup',
    description: 'Looks up a value in the first row of a range and returns a value in the same column',
    syntax: 'HLOOKUP(lookup_value, table_array, row_index_num, range_lookup)',
    parameters: [
      { name: 'lookup_value', type: 'any', required: true, description: 'Value to search for' },
      { name: 'table_array', type: 'range', required: true, description: 'Range to search in' },
      { name: 'row_index_num', type: 'number', required: true, description: 'Row number to return' },
      { name: 'range_lookup', type: 'boolean', required: false, description: 'TRUE for approximate match, FALSE for exact', defaultValue: true }
    ],
    returnType: 'any',
    examples: ['HLOOKUP("Q1", A1:D3, 2, FALSE)', 'HLOOKUP(A1, B1:D3, 3, TRUE)'],
    supportedTypes: ['*']
  }
];

// ===== STATISTICAL FUNCTIONS =====
export const STATISTICAL_FUNCTIONS: ExcelFunction[] = [
  {
    name: 'COUNTIF',
    category: 'Statistical',
    description: 'Counts the number of values in a column that meet a criterion',
    syntax: 'COUNTIF(column_name, operator, value)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to count' },
      { name: 'operator', type: 'string', required: true, description: 'Comparison operator' },
      { name: 'value', type: 'string', required: true, description: 'Value to compare against' }
    ],
    returnType: 'number',
    examples: ['COUNTIF("amount", ">", "5")', 'COUNTIF("status", "=", "Active")'],
    supportedTypes: ['*']
  },
  {
    name: 'SUMIF',
    category: 'Statistical',
    description: 'Adds values in a column that meet a given criteria',
    syntax: 'SUMIF(column_name, operator, value)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to sum' },
      { name: 'operator', type: 'string', required: true, description: 'Comparison operator' },
      { name: 'value', type: 'string', required: true, description: 'Value to compare against' }
    ],
    returnType: 'number',
    examples: ['SUMIF("amount", ">", "5")', 'SUMIF("amount", "=", "100")'],
    supportedTypes: ['integer', 'decimal', 'number']
  },
  {
    name: 'AVERAGEIF',
    category: 'Statistical',
    description: 'Returns the average of values in a column that meet a criterion',
    syntax: 'AVERAGEIF(column_name, operator, value)',
    parameters: [
      { name: 'column_name', type: 'string', required: true, description: 'Name of the column to average' },
      { name: 'operator', type: 'string', required: true, description: 'Comparison operator' },
      { name: 'value', type: 'string', required: true, description: 'Value to compare against' }
    ],
    returnType: 'number',
    examples: ['AVERAGEIF("amount", ">", "5")', 'AVERAGEIF("amount", "=", "100")'],
    supportedTypes: ['integer', 'decimal', 'number']
  }
];

// Combine all functions
export const ALL_FUNCTIONS: ExcelFunction[] = [
  ...TEXT_FUNCTIONS,
  ...NUMERIC_FUNCTIONS,
  ...DATE_FUNCTIONS,
  ...LOGICAL_FUNCTIONS,
  ...LOOKUP_FUNCTIONS,
  ...STATISTICAL_FUNCTIONS
];

// Function categories for UI organization
export const FUNCTION_CATEGORIES = [
  { id: 'text', name: 'Text Functions', functions: TEXT_FUNCTIONS },
  { id: 'math', name: 'Math Functions', functions: NUMERIC_FUNCTIONS },
  { id: 'date', name: 'Date Functions', functions: DATE_FUNCTIONS },
  { id: 'logical', name: 'Logical Functions', functions: LOGICAL_FUNCTIONS },
  { id: 'lookup', name: 'Lookup Functions', functions: LOOKUP_FUNCTIONS },
  { id: 'statistical', name: 'Statistical Functions', functions: STATISTICAL_FUNCTIONS }
];

// Helper function to get functions by field type
export const getFunctionsByFieldType = (fieldType: string): ExcelFunction[] => {
  return ALL_FUNCTIONS.filter(func => 
    func.supportedTypes.includes('*') || func.supportedTypes.includes(fieldType)
  );
};

// Helper function to get functions by category
export const getFunctionsByCategory = (category: string): ExcelFunction[] => {
  const categoryObj = FUNCTION_CATEGORIES.find(cat => cat.id === category);
  return categoryObj ? categoryObj.functions : [];
};

// Helper function to search functions
export const searchFunctions = (query: string): ExcelFunction[] => {
  const lowerQuery = query.toLowerCase();
  return ALL_FUNCTIONS.filter(func => 
    func.name.toLowerCase().includes(lowerQuery) ||
    func.description.toLowerCase().includes(lowerQuery) ||
    func.category.toLowerCase().includes(lowerQuery)
  );
};

// Function execution engine (placeholder for actual implementation)
export const executeFunction = (functionName: string, params: (string | number | boolean)[], fieldType: string): string | number | boolean => {
  // This would contain the actual implementation of each function
  // For now, return a placeholder
  console.log(`Executing ${functionName} with params:`, params, 'for field type:', fieldType);
  return `Result of ${functionName}`;
}; 