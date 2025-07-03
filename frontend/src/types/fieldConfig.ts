export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'object' | 'array';

export interface FieldMetadata {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  sampleValue?: unknown;
  usageStats?: {
    count: number;
    distinct: number;
    nulls: number;
    min?: number;
    max?: number;
    avg?: number;
  };
  group?: string;
  category?: string;
}

export interface FieldFormatting {
  pattern?: string;
  locale?: string;
  dateFormat?: string;
  numberFormat?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  conditionalFormatting?: Array<{
    condition: string;
    style: Record<string, string | number | boolean | undefined>;
  }>;
}

export interface CalculatedField {
  id: string;
  name: string;
  expression: string;
  type: FieldType;
  description?: string;
  previewValue?: unknown;
}

export interface AggregationConfig {
  groupBy: string[];
  aggregations: Array<{
    field: string;
    function: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'custom';
    customFunction?: string;
    alias?: string;
    handleNulls?: 'ignore' | 'zero' | 'custom';
  }>;
  nested?: AggregationConfig;
}

export interface FieldConfig {
  metadata: FieldMetadata;
  selected: boolean;
  order: number;
  formatting?: FieldFormatting;
  calculated?: CalculatedField;
  aggregation?: AggregationConfig;
  validationErrors?: string[];
}

export interface FieldConfigState {
  fields: FieldConfig[];
  calculatedFields: CalculatedField[];
  aggregation?: AggregationConfig;
} 