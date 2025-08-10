import { ReportTemplate, TemplateBinding, TableSelection, JoinConfig, FieldSelection, FilterConfig, OrderByConfig, ParameterConfig, LayoutSection, LayoutStyling, ResponsiveConfig } from './reportTemplate';

export interface WizardStepData {
  [key: string]: unknown;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps<unknown>>;
  isOptional?: boolean;
  validation?: WizardStepValidation;
  shouldSkip?: (data: Record<string, WizardStepData>) => boolean;
}

export interface WizardStepProps<T = WizardStepData> {
  data: T;
  wizardData: Record<string, WizardStepData>;
  validation?: WizardStepValidation;
  onDataChange: (data: T) => void;
}

export interface WizardStepValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code?: string;
}

export interface BasicInfoData extends WizardStepData {
  name: string;
  description: string;
  category: string;
  templateType: string;
  tags: string[];
}

export interface DataSourceData extends WizardStepData {
  dataSourceId: string;
  queryMode: 'visual' | 'sql';
  queryConfig: {
    tables: TableSelection[];
    joins: JoinConfig[];
    fields: FieldSelection[];
    filters: FilterConfig[];
    groupBy: string[];
    orderBy: OrderByConfig[];
  };
  sqlQuery: string;
  parameters: ParameterConfig[];
}

export interface FieldConfigData extends WizardStepData {
  selectedFields: FieldSelection[];
  fieldFormatting: Record<string, unknown>;
  fieldOrdering: string[];
  groupingConfig: Record<string, unknown>;
}

export interface LayoutData extends WizardStepData {
  sections: LayoutSection[];
  styling: LayoutStyling;
  responsive: ResponsiveConfig;
}

export interface StylingData extends WizardStepData {
  colors: LayoutStyling['colors'];
  fonts: LayoutStyling['fonts'];
  spacing: LayoutStyling['spacing'];
  branding: Record<string, unknown>;
}

export interface ParametersData extends WizardStepData {
  parameters: ParameterConfig[];
}

export interface BindingData extends WizardStepData {
  bindings: TemplateBinding[];
}

export interface ReviewData extends WizardStepData {
  templatePreview: Partial<ReportTemplate>;
  validationResults: WizardStepValidation;
}

export interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  data: Record<string, WizardStepData>;
  validation: Record<number, WizardStepValidation>;
  isLoading: boolean;
  error?: string;
} 