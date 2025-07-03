import React, { useState } from 'react';
import { FieldType, CalculatedField, FieldConfig } from '../../types/fieldConfig';

interface CalculatedFieldBuilderProps {
  onSave: (field: CalculatedField) => void;
  onCancel: () => void;
  availableFields: FieldConfig[];
}

const functionLibrary = [
  { name: 'SUM', desc: 'Sum of values', example: 'SUM(field1, field2)' },
  { name: 'AVG', desc: 'Average', example: 'AVG(field1)' },
  { name: 'IF', desc: 'Conditional', example: 'IF(field1 > 0, "Yes", "No")' },
  { name: 'CONCAT', desc: 'Concatenate', example: 'CONCAT(field1, field2)' },
  // Add more as needed
];

const CalculatedFieldBuilder: React.FC<CalculatedFieldBuilderProps> = ({ onSave, onCancel, availableFields }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<FieldType>('string');
  const [expression, setExpression] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>('');

  // Simple syntax validation (expand as needed)
  const validate = (expr: string) => {
    if (!expr) return 'Expression required';
    // Basic check for allowed field names
    const fieldNames = availableFields.map(f => f.metadata.name);
    const fieldRefs = expr.match(/\b\w+\b/g) || [];
    for (const ref of fieldRefs) {
      if (fieldNames.includes(ref)) continue;
      if (functionLibrary.some(fn => fn.name === ref.toUpperCase())) continue;
      if (!/^[0-9]+$/.test(ref)) return `Unknown reference: ${ref}`;
    }
    return null;
  };

  const handleExpressionChange = (expr: string) => {
    setExpression(expr);
    const err = validate(expr);
    setError(err);
    // Simple preview: just echo for now
    setPreview(err ? '' : expr);
  };

  const handleSave = () => {
    if (!name || !expression || error) return;
    onSave({
      id: name,
      name,
      expression,
      type,
      previewValue: preview,
    });
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, background: '#fff', position: 'fixed', right: 40, top: 120, zIndex: 1000 }}>
      <h3>Add Calculated Field</h3>
      <label>Name: <input type="text" value={name} onChange={e => setName(e.target.value)} /></label><br />
      <label>Type:
        <select value={type} onChange={e => setType(e.target.value as FieldType)}>
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="boolean">Boolean</option>
        </select>
      </label><br />
      <label>Expression:<br />
        <textarea value={expression} onChange={e => handleExpressionChange(e.target.value)} rows={3} cols={40} />
      </label><br />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <strong>Preview:</strong> <span style={{ background: '#f6f6f6', padding: 4 }}>{preview}</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleSave} disabled={!name || !expression || !!error}>Save</button>
        <button onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Function Library:</strong>
        <ul>
          {functionLibrary.map(fn => (
            <li key={fn.name}><b>{fn.name}</b>: {fn.desc} <em>e.g. {fn.example}</em></li>
          ))}
        </ul>
        <strong>Available Fields:</strong> {availableFields.map(f => f.metadata.name).join(', ')}
      </div>
    </div>
  );
};

export default CalculatedFieldBuilder; 