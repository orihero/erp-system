export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  category: ReportCategory;
  version: number;
  isActive: boolean;
  templateType: TemplateType;
  tags: string[];
  dataSourceConfig: DataSourceConfig;
  layoutConfig: LayoutConfig;
  parametersConfig: ParameterConfig[];
  outputConfig: OutputConfig;
  createdBy: string;
  updatedBy?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  updater?: User;
  company?: Company;
  bindings?: TemplateBinding[];
}

export type ReportCategory = 'financial' | 'operational' | 'hr' | 'sales' | 'inventory' | 'custom';
export type TemplateType = 'tabular' | 'chart' | 'dashboard' | 'document';

export interface DataSourceConfig {
  type: 'database' | 'api' | 'file';
  connectionId: string;
  query?: QueryConfig;
  parameters?: ParameterConfig[];
}

export interface QueryConfig {
  tables: TableSelection[];
  joins: JoinConfig[];
  fields: FieldSelection[];
  filters: FilterConfig[];
  groupBy: string[];
  orderBy: OrderByConfig[];
}

export interface TableSelection {
  id: string;
  name: string;
  alias?: string;
  schema?: string;
}

export interface JoinConfig {
  id: string;
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  leftTable: string;
  rightTable: string;
  leftField: string;
  rightField: string;
}

export interface FieldSelection {
  id: string;
  name: string;
  alias?: string;
  table: string;
  dataType: string;
  aggregation?: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX';
  formatting?: FieldFormatting;
}

export interface FieldFormatting {
  type: 'number' | 'currency' | 'percentage' | 'date' | 'text';
  options?: {
    decimals?: number;
    currency?: string;
    dateFormat?: string;
    prefix?: string;
    suffix?: string;
  };
}

export interface FilterConfig {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'between';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface OrderByConfig {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface LayoutConfig {
  sections: LayoutSection[];
  styling?: LayoutStyling;
  responsive?: ResponsiveConfig;
}

export interface LayoutSection {
  id: string;
  type: 'header' | 'table' | 'chart' | 'text' | 'image' | 'footer';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  properties: Record<string, unknown>;
  children?: LayoutSection[];
}

export interface LayoutStyling {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    family?: string;
    sizes?: Record<string, number>;
  };
  spacing?: {
    margin?: number;
    padding?: number;
  };
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  layouts: Record<string, LayoutSection[]>;
}

export interface ParameterConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'multi-select' | 'file' | 'custom';
  required: boolean;
  defaultValue?: unknown;
  defaultStrategy?: ParameterDefaultStrategy;
  validation?: ParameterValidation;
  options?: ParameterOption[];
  dependencies?: ParameterDependency[];
  group?: string;
  order?: number;
  ui?: ParameterUIHints;
  description?: string;
}

export interface ParameterValidation {
  min?: number | string;
  max?: number | string;
  pattern?: string;
  format?: string;
  regex?: string;
  customRule?: string;
}

export interface ParameterOption {
  value: unknown;
  label: string;
  description?: string;
}

export interface ParameterDependency {
  parameter: string;
  condition: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'custom';
  value: unknown;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'custom';
}

export interface ParameterDefaultStrategy {
  type: 'static' | 'dynamic' | 'calculated';
  expression?: string;
}

export interface ParameterUIHints {
  widget?: string;
  placeholder?: string;
  [key: string]: unknown;
}

export interface OutputConfig {
  formats: OutputFormat[];
  scheduling?: SchedulingConfig;
  distribution?: DistributionConfig;
}

export type OutputFormat = 'pdf' | 'excel' | 'csv' | 'html' | 'json';

export interface SchedulingConfig {
  enabled: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  time?: string;
  timezone?: string;
}

export interface DistributionConfig {
  enabled: boolean;
  recipients?: string[];
  subject?: string;
  message?: string;
}

export interface TemplateBinding {
  id: string;
  reportStructureId: string;
  companyId?: string;
  moduleId?: string;
  bindingType: 'company' | 'module' | 'company_module' | 'global';
  accessLevel: 'read' | 'execute' | 'modify' | 'admin';
  inheritanceEnabled: boolean;
  customizationAllowed: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  company?: Company;
  module?: Module;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  category?: string;
} 