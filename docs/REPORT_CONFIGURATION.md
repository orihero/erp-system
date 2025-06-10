# Report Configuration System Implementation

## Overview
This document outlines the implementation plan for the report configuration system using Univer spreadsheet integration. The system will allow users to create, configure, and generate reports with dynamic data from the ERP system.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Components](#components)
3. [Data Flow](#data-flow)
4. [Implementation Phases](#implementation-phases)
5. [Technical Details](#technical-details)
6. [API Specifications](#api-specifications)

## System Architecture

### High-Level Architecture
```
[User Interface] → [Report Configuration] → [Univer Spreadsheet] → [Data Connectors] → [ERP Database]
```

### Key Components
1. **Report Configuration UI**
   - Report type selection
   - Data source configuration
   - Filter setup
   - Preview interface

2. **Univer Integration**
   - Spreadsheet editor
   - Custom toolbar
   - Formula system

3. **Data Connection Layer**
   - Database connectors
   - Formula registry
   - Data transformers

4. **Template Management**
   - Template storage
   - Template versioning
   - Template sharing

## Components

### 1. Report Configuration Interface
```typescript
interface ReportConfig {
  id: string;
  name: string;
  type: ReportType;
  dataSources: DataSource[];
  filters: Filter[];
  structure: ReportStructure;
}
```

### 2. Univer Integration
- Custom toolbar for report-specific actions
- Formula input interface
- Data binding system
- Preview capabilities

### 3. Data Connectors
```typescript
interface DataConnector {
  table: string;
  fields: string[];
  filters: Record<string, any>;
  transform: (data: any) => any;
}
```

### 4. Template System
```typescript
interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  structure: {
    spreadsheet: {
      cells: Record<string, CellDefinition>;
      formulas: Record<string, FormulaDefinition>;
    };
    charts: ChartDefinition[];
    pivots: PivotDefinition[];
  };
  dataSources: DataConnector[];
  filters: FilterDefinition[];
}
```

## Data Flow

1. **Report Creation**
   ```
   User Input → Report Config → Template Generation → Storage
   ```

2. **Data Retrieval**
   ```
   Template → Data Connectors → ERP Database → Data Transformation → Spreadsheet
   ```

3. **Report Generation**
   ```
   Template + Data → Formula Evaluation → Report Generation → Preview/Export
   ```

## Implementation Phases

### Phase 1: Basic Setup
1. **UI Components**
   - Report configuration interface
   - Basic Univer integration
   - Initial toolbar setup

2. **Data Connection**
   - Basic database connectors
   - Simple formula system
   - Data transformation layer

### Phase 2: Template System
1. **Template Structure**
   - Define template schema
   - Implement storage system
   - Create management interface

2. **Formula System**
   - Basic ERP formulas
   - Custom formula builder
   - Formula validation

### Phase 3: Advanced Features
1. **Charts and Pivots**
   - Chart configuration
   - Pivot table setup
   - Data visualization

2. **Export and Sharing**
   - PDF export
   - Template sharing
   - Version control

## Technical Details

### File Structure
```
frontend/src/pages/reports/
├── components/
│   ├── ReportConfig.tsx
│   ├── UniverSheet.tsx
│   ├── FormulaBuilder.tsx
│   └── Preview/
│       ├── ReportPreview.tsx
│       ├── ChartRenderer.tsx
│       └── PivotRenderer.tsx
├── services/
│   ├── connectors/
│   │   ├── DatabaseConnector.ts
│   │   └── FormulaRegistry.ts
│   ├── templates/
│   │   ├── TemplateService.ts
│   │   └── TemplateRepository.ts
│   └── engine/
│       ├── ReportGenerator.ts
│       └── FormulaEvaluator.ts
└── types/
    ├── ReportTemplate.ts
    ├── DataSource.ts
    └── Formula.ts
```

### Key Technologies
- React for UI components
- Univer for spreadsheet functionality
- TypeScript for type safety
- Redux for state management
- Axios for API communication

## API Specifications

### Template Management
```typescript
// Template Service
interface TemplateService {
  createTemplate(config: ReportConfig): Promise<ReportTemplate>;
  getTemplate(id: string): Promise<ReportTemplate>;
  updateTemplate(id: string, config: ReportConfig): Promise<ReportTemplate>;
  deleteTemplate(id: string): Promise<void>;
  listTemplates(): Promise<ReportTemplate[]>;
}
```

### Data Connectors
```typescript
// Data Connector Service
interface DataConnectorService {
  connect(source: DataSource): Promise<Connection>;
  fetchData(connection: Connection, query: Query): Promise<any>;
  transformData(data: any, transform: Transform): Promise<any>;
}
```

### Formula System
```typescript
// Formula Registry
interface FormulaRegistry {
  registerFormula(name: string, formula: Formula): void;
  evaluateFormula(name: string, params: any): Promise<any>;
  listFormulas(): Formula[];
}
```

## Next Steps

1. **Immediate Actions**
   - Set up basic project structure
   - Implement Univer integration
   - Create initial UI components

2. **Short-term Goals**
   - Implement data connectors
   - Create template system
   - Build formula registry

3. **Long-term Goals**
   - Add advanced features
   - Implement sharing capabilities
   - Optimize performance

## Dependencies

- Univer: ^7.1.1
- React: ^19.1.0
- TypeScript: ~5.8.3
- Material-UI: ^7.1.1

## Notes

- All components should be properly typed using TypeScript
- Follow React best practices for component structure
- Implement proper error handling and loading states
- Use proper state management for complex data flows
- Ensure proper testing coverage for all components

## References

- [Univer Documentation](https://docs.univer.ai/en-US/guides/sheets)
- [Material-UI Documentation](https://mui.com/material-ui/react-grid/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) 