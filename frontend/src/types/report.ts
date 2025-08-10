// Report structure and template types for report CRUD

export interface DataSource {
  id: string;
  type: string;
  config: Record<string, unknown>;
}

export interface Filter {
  id: string;
  field: string;
  operator: string;
  value: unknown;
}

// Define spreadsheet, chart, and pivot types more specifically if possible
export interface SpreadsheetStructure {
  cells: Record<string, unknown>;
  formulas: Record<string, string>;
}

export interface ChartStructure {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: unknown;
  range: string;
}

export interface PivotStructure {
  // Define as needed
  [key: string]: unknown;
}

export interface ReportConfig {
  id: string;
  name: string;
  type: string;
  dataSources: DataSource[];
  filters: Filter[];
  structure: {
    spreadsheet: SpreadsheetStructure;
    charts: ChartStructure[];
    pivots?: PivotStructure[];
  };
}

export interface ReportTemplate extends ReportConfig {
  createdAt?: string;
  updatedAt?: string;
} 