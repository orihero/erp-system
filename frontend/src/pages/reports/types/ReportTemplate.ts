export type ReportType = 'Chart' | 'Table' | 'Grid' | 'Pivot';

export interface DataSource {
  id: string;
  name: string;
  type: string;
  connection: string;
  query: string;
  parameters: Record<string, any>;
}

export interface Filter {
  id: string;
  field: string;
  operator: string;
  value: any;
}

export interface CellDefinition {
  value: string | number;
  formula?: string;
  style?: Record<string, any>;
}

export interface FormulaDefinition {
  id: string;
  formula: string;
  parameters: string[];
  description: string;
}

export interface ChartDefinition {
  id: string;
  type: string;
  dataSource: string;
  xAxis: string;
  yAxis: string[];
  options: Record<string, any>;
}

export interface PivotDefinition {
  id: string;
  dataSource: string;
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
  type: ReportType;
  description: string;
  dataSources: DataSource[];
  filters: Filter[];
  structure: ReportStructure;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  structure: ReportStructure;
  dataSources: DataSource[];
  filters: Filter[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublic: boolean;
} 