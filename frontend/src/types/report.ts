export type ReportType = 'financial' | 'inventory' | 'sales' | 'custom';

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file';
  config: Record<string, any>;
}

export interface Filter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
}

export interface CellDefinition {
  id: string;
  value: string | number;
  formula?: string;
  style?: Record<string, any>;
}

export interface FormulaDefinition {
  id: string;
  name: string;
  formula: string;
  parameters: string[];
}

export interface ChartDefinition {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter';
  dataSource: string;
  xAxis: string;
  yAxis: string;
  options: Record<string, any>;
}

export interface PivotDefinition {
  id: string;
  rows: string[];
  columns: string[];
  values: string[];
  filters: Filter[];
}

export interface ReportStructure {
  spreadsheet: {
    cells: Record<string, CellDefinition>;
    formulas: Record<string, FormulaDefinition>;
  };
  charts: ChartDefinition[];
  pivots: PivotDefinition[];
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'custom' | 'chart' | 'table' | 'grid';
  dataSources: any[];
  filters: any[];
  structure: {
    spreadsheet: {
      cells: Record<string, any>;
      formulas: Record<string, any>;
    };
    charts: any[];
    pivots: any[];
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  structure: ReportStructure;
  dataSources: DataSource[];
  filters: Filter[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublic: boolean;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  type: 'custom' | 'chart' | 'table' | 'grid';
  dataSources: any[];
  filters: any[];
  structure: {
    spreadsheet: {
      cells: Record<string, any>;
      formulas: Record<string, any>;
    };
    charts: any[];
    pivots: any[];
  };
} 