export type ReportType = 'sales' | 'inventory' | 'custom';

export interface DataSource {
  id: string;
  name: string;
  table: string;
  fields: string[];
  description?: string;
}

export interface Filter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

export interface ReportStructure {
  spreadsheet: {
    cells: Record<string, CellDefinition>;
    formulas: Record<string, FormulaDefinition>;
  };
  charts: ChartDefinition[];
  pivots: PivotDefinition[];
}

export interface CellDefinition {
  value: string | number;
  formula?: string;
  format?: string;
  style?: Record<string, any>;
}

export interface FormulaDefinition {
  name: string;
  formula: string;
  parameters: string[];
  description?: string;
}

export interface ChartDefinition {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter';
  dataSource: string;
  xAxis: string;
  yAxis: string;
  title: string;
  options?: Record<string, any>;
}

export interface PivotDefinition {
  id: string;
  dataSource: string;
  rows: string[];
  columns: string[];
  values: string[];
  filters?: Filter[];
}

export interface ReportConfig {
  id: string;
  name: string;
  type: ReportType;
  dataSources: DataSource[];
  filters: Filter[];
  structure: ReportStructure;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
} 