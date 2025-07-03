import React, { useState } from 'react';
import { FieldConfig, FieldFormatting } from '../../types/fieldConfig';

interface FieldFormattingPanelProps {
  field: FieldConfig;
  formatting?: FieldFormatting;
  onChange: (formatting: FieldFormatting) => void;
  onClose: () => void;
}

const FieldFormattingPanel: React.FC<FieldFormattingPanelProps> = ({ field, formatting = {}, onChange, onClose }) => {
  const [localFormatting, setLocalFormatting] = useState<FieldFormatting>(formatting);

  const handleChange = <T extends keyof FieldFormatting>(key: T, value: FieldFormatting[T]) => {
    const updated = { ...localFormatting, [key]: value };
    setLocalFormatting(updated);
    onChange(updated);
  };

  // Real-time preview logic (simple for now)
  const getPreview = () => {
    const value = field.metadata.sampleValue;
    if (field.metadata.type === 'number' && localFormatting.numberFormat) {
      try {
        return new Intl.NumberFormat(localFormatting.locale, { style: 'decimal' }).format(Number(value));
      } catch {
        return value;
      }
    }
    if (field.metadata.type === 'date' && localFormatting.dateFormat) {
      try {
        return new Date(value as string).toLocaleDateString(localFormatting.locale, { dateStyle: 'medium' });
      } catch {
        return value;
      }
    }
    if (field.metadata.type === 'string' && localFormatting.textTransform) {
      switch (localFormatting.textTransform) {
        case 'uppercase': return String(value).toUpperCase();
        case 'lowercase': return String(value).toLowerCase();
        case 'capitalize': return String(value).charAt(0).toUpperCase() + String(value).slice(1);
        default: return value;
      }
    }
    return value;
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, background: '#fff', position: 'fixed', right: 40, top: 40, zIndex: 1000 }}>
      <h3>Format Field: {field.metadata.label}</h3>
      <button onClick={onClose} style={{ float: 'right' }}>Close</button>
      <div style={{ marginBottom: 12 }}>
        <strong>Preview:</strong> <span style={{ background: '#f6f6f6', padding: 4 }}>{String(getPreview())}</span>
      </div>
      {field.metadata.type === 'number' && (
        <>
          <label>Number Format (Intl): <input type="text" value={localFormatting.numberFormat || ''} onChange={e => handleChange('numberFormat', e.target.value)} placeholder="e.g. 1,234.56" /></label><br />
        </>
      )}
      {field.metadata.type === 'date' && (
        <>
          <label>Date Format: <input type="text" value={localFormatting.dateFormat || ''} onChange={e => handleChange('dateFormat', e.target.value)} placeholder="e.g. yyyy-MM-dd" /></label><br />
        </>
      )}
      {field.metadata.type === 'string' && (
        <>
          <label>Text Transform:
            <select value={localFormatting.textTransform || 'none'} onChange={e => handleChange('textTransform', e.target.value as FieldFormatting['textTransform'])}>
              <option value="none">None</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </label><br />
        </>
      )}
      <label>Locale:
        <input type="text" value={localFormatting.locale || ''} onChange={e => handleChange('locale', e.target.value)} placeholder="e.g. en-US" />
      </label><br />
      <label>Custom Pattern:
        <input type="text" value={localFormatting.pattern || ''} onChange={e => handleChange('pattern', e.target.value)} placeholder="e.g. #,##0.00" />
      </label><br />
      {/* Add more formatting options as needed */}
    </div>
  );
};

export default FieldFormattingPanel; 