import React from 'react';
import { FieldConfig } from '../../types/fieldConfig';

interface FieldGroupPanelProps {
  fields: FieldConfig[];
  onGroupChange: (updatedFields: FieldConfig[]) => void;
  availableGroups?: string[];
  availableCategories?: string[];
}

const FieldGroupPanel: React.FC<FieldGroupPanelProps> = ({ fields, onGroupChange, availableGroups = [], availableCategories = [] }) => {
  const handleGroupChange = (idx: number, group: string) => {
    const updated = fields.map((f, i) => i === idx ? { ...f, metadata: { ...f.metadata, group } } : f);
    onGroupChange(updated);
  };
  const handleCategoryChange = (idx: number, category: string) => {
    const updated = fields.map((f, i) => i === idx ? { ...f, metadata: { ...f.metadata, category } } : f);
    onGroupChange(updated);
  };

  return (
    <div style={{ margin: '16px 0' }}>
      <h3>Field Grouping & Categorization</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Field</th>
            <th>Group</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, idx) => (
            <tr key={field.metadata.name}>
              <td>{field.metadata.label}</td>
              <td>
                <input
                  type="text"
                  value={field.metadata.group || ''}
                  list="group-list"
                  onChange={e => handleGroupChange(idx, e.target.value)}
                  placeholder="Group"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={field.metadata.category || ''}
                  list="category-list"
                  onChange={e => handleCategoryChange(idx, e.target.value)}
                  placeholder="Category"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <datalist id="group-list">
        {availableGroups.map(g => <option key={g} value={g} />)}
      </datalist>
      <datalist id="category-list">
        {availableCategories.map(c => <option key={c} value={c} />)}
      </datalist>
    </div>
  );
};

export default FieldGroupPanel; 