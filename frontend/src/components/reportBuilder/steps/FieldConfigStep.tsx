import React, { useState } from 'react';
import { WizardStepProps } from '../../../types/wizard';
import FieldList from '../FieldList';
import type { Field } from '../FieldList';
// Placeholder imports for subcomponents (to be implemented)
// import FieldFormattingPanel from '../FieldFormattingPanel';
// import CalculatedFieldBuilder from '../CalculatedFieldBuilder';
// import AggregationPanel from '../AggregationPanel';
// import ValidationFeedback from '../ValidationFeedback';

// Mock data for initial fields (to be replaced with real data)
const mockFields: Field[] = [
  { id: '1', name: 'Amount', type: 'number', description: 'Transaction amount', sample: 123.45, usage: 98 },
  { id: '2', name: 'Date', type: 'date', description: 'Transaction date', sample: '2024-07-01', usage: 87 },
  { id: '3', name: 'Description', type: 'string', description: 'Transaction description', sample: 'Payment', usage: 65 },
];

export const FieldConfigStep: React.FC<WizardStepProps> = () => {
  const [fields, setFields] = useState<Field[]>(mockFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const handleReorder = (newFields: Field[]) => {
    setFields(newFields);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 24, minHeight: 500 }}>
      {/* Field List & Grouping */}
      <div style={{ flex: 2, minWidth: 350 }}>
        <FieldList fields={fields} onSelect={setSelectedFieldId} selectedFieldId={selectedFieldId} onReorder={handleReorder} />
      </div>
      {/* Field Formatting & Calculated Fields */}
      <div style={{ flex: 3, minWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* <FieldFormattingPanel field={fields.find(f => f.id === selectedFieldId)} /> */}
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <strong>Field Formatting Panel (placeholder)</strong>
          {/* TODO: Implement FieldFormattingPanel with live preview */}
        </div>
        {/* <CalculatedFieldBuilder onAdd={...} /> */}
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <strong>Calculated Field Builder (placeholder)</strong>
          {/* TODO: Implement CalculatedFieldBuilder with expression editor */}
        </div>
      </div>
      {/* Aggregation & Validation */}
      <div style={{ flex: 2, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* <AggregationPanel groupedFields={groupedFields} /> */}
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <strong>Aggregation Panel (placeholder)</strong>
          {/* TODO: Implement AggregationPanel for grouping/aggregation */}
        </div>
        {/* <ValidationFeedback /> */}
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <strong>Validation Feedback (placeholder)</strong>
          {/* TODO: Implement ValidationFeedback for real-time feedback */}
        </div>
      </div>
    </div>
  );
}; 