import React, { useState } from 'react';
import { FieldConfig, FieldFormatting, CalculatedField, AggregationConfig } from '../../types/fieldConfig';
import FieldOrderDnD from './FieldOrderDnD';
import FieldGroupPanel from './FieldGroupPanel';
import FieldFormattingPanel from './FieldFormattingPanel';
import CalculatedFieldBuilder from './CalculatedFieldBuilder';
import AggregationPanel from './AggregationPanel';
// Placeholder imports for subcomponents
// import FieldListTable from './FieldListTable';
// import FieldFormattingPanel from './FieldFormattingPanel';

const mockFields: FieldConfig[] = [
  {
    metadata: {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      description: 'Transaction amount',
      sampleValue: 123.45,
      usageStats: { count: 1000, distinct: 900, nulls: 0, min: 0, max: 10000, avg: 500 },
      group: 'Financial',
      category: 'Transaction',
    },
    selected: false,
    order: 0,
  },
  {
    metadata: {
      name: 'date',
      label: 'Date',
      type: 'date',
      description: 'Transaction date',
      sampleValue: '2024-07-01',
      usageStats: { count: 1000, distinct: 365, nulls: 0 },
      group: 'Financial',
      category: 'Transaction',
    },
    selected: false,
    order: 1,
  },
  // Add more mock fields as needed
];

const FieldConfigStep: React.FC = () => {
  const [fields, setFields] = useState<FieldConfig[]>(mockFields);
  const [search, setSearch] = useState('');
  const [bulkSelect, setBulkSelect] = useState(false);
  const [formattingField, setFormattingField] = useState<FieldConfig | null>(null);
  const [calcFieldBuilderOpen, setCalcFieldBuilderOpen] = useState(false);
  const [aggregationPanelOpen, setAggregationPanelOpen] = useState(false);
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([]);
  const [aggregation, setAggregation] = useState<AggregationConfig | undefined>(undefined);

  const filteredFields = fields.filter(f =>
    f.metadata.label.toLowerCase().includes(search.toLowerCase()) ||
    f.metadata.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleBulkSelect = () => {
    const newSelected = !bulkSelect;
    setBulkSelect(newSelected);
    setFields(fields.map(f => ({ ...f, selected: newSelected })));
  };

  const handleOrderChange = (newFields: FieldConfig[]) => {
    setFields(newFields);
  };

  const handleGroupChange = (updatedFields: FieldConfig[]) => {
    setFields(updatedFields);
  };

  // Extract unique groups and categories for datalist
  const availableGroups = Array.from(new Set(fields.map(f => f.metadata.group).filter(Boolean))) as string[];
  const availableCategories = Array.from(new Set(fields.map(f => f.metadata.category).filter(Boolean))) as string[];

  const handleFormattingChange = (formatting: FieldFormatting) => {
    if (!formattingField) return;
    setFields(fields =>
      fields.map(f =>
        f.metadata.name === formattingField.metadata.name
          ? { ...f, formatting }
          : f
      )
    );
  };

  const handleAddCalculatedField = (field: CalculatedField) => {
    setCalculatedFields([...calculatedFields, field]);
    setCalcFieldBuilderOpen(false);
    // Optionally add to fields list for selection/order
    setFields([...fields, {
      metadata: {
        name: field.name,
        label: field.name,
        type: field.type,
        description: field.description,
        sampleValue: field.previewValue,
      },
      selected: true,
      order: fields.length,
      calculated: field,
    }]);
  };

  const handleAggregationChange = (agg: AggregationConfig) => {
    setAggregation(agg);
  };

  return (
    <div>
      <h2>Field Configuration</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search fields..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={handleBulkSelect} style={{ marginLeft: 8 }}>
          {bulkSelect ? 'Deselect All' : 'Select All'}
        </button>
        <button onClick={() => setCalcFieldBuilderOpen(true)} style={{ marginLeft: 16 }}>
          + Add Calculated Field
        </button>
        <button onClick={() => setAggregationPanelOpen(true)} style={{ marginLeft: 8 }}>
          Configure Aggregation
        </button>
      </div>
      <FieldGroupPanel
        fields={filteredFields}
        onGroupChange={handleGroupChange}
        availableGroups={availableGroups}
        availableCategories={availableCategories}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th></th>
            <th>Select</th>
            <th>Field Name</th>
            <th>Label</th>
            <th>Type</th>
            <th>Description</th>
            <th>Sample</th>
            <th>Usage</th>
            <th>Group</th>
            <th>Category</th>
            <th>Order</th>
            <th>Format</th>
          </tr>
        </thead>
        <FieldOrderDnD
          fields={filteredFields}
          onOrderChange={handleOrderChange}
          onFormat={setFormattingField}
        />
      </table>
      {/* Validation and real-time feedback */}
      <div style={{ marginTop: 12 }}>
        {(() => {
          // Validation logic
          const errors: string[] = [];
          const nameSet = new Set<string>();
          fields.forEach(f => {
            if (!f.metadata.name) errors.push('Field with empty name');
            if (nameSet.has(f.metadata.name)) errors.push(`Duplicate field name: ${f.metadata.name}`);
            nameSet.add(f.metadata.name);
            if (!f.metadata.label) errors.push(`Field ${f.metadata.name} missing label`);
            if (!f.metadata.type) errors.push(`Field ${f.metadata.name} missing type`);
          });
          if (errors.length > 0) {
            return <div style={{ color: 'red' }}><b>Validation Errors:</b><ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div>;
          }
          return <div style={{ color: 'green' }}>All field configurations are valid.</div>;
        })()}
      </div>
      {formattingField && (
        <FieldFormattingPanel
          field={formattingField}
          formatting={formattingField.formatting}
          onChange={handleFormattingChange}
          onClose={() => setFormattingField(null)}
        />
      )}
      {calcFieldBuilderOpen && (
        <CalculatedFieldBuilder
          onSave={handleAddCalculatedField}
          onCancel={() => setCalcFieldBuilderOpen(false)}
          availableFields={fields}
        />
      )}
      {aggregationPanelOpen && (
        <AggregationPanel
          fields={fields}
          aggregation={aggregation}
          onChange={handleAggregationChange}
          onClose={() => setAggregationPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default FieldConfigStep; 