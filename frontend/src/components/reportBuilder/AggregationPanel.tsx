import React, { useState } from 'react';
import { FieldConfig, AggregationConfig } from '../../types/fieldConfig';

interface AggregationPanelProps {
  fields: FieldConfig[];
  aggregation?: AggregationConfig;
  onChange: (aggregation: AggregationConfig) => void;
  onClose: () => void;
}

const aggFuncs = ['sum', 'avg', 'min', 'max', 'count', 'custom'] as const;

const AggregationPanel: React.FC<AggregationPanelProps> = ({ fields, aggregation, onChange, onClose }) => {
  const [localAgg, setLocalAgg] = useState<AggregationConfig>(
    aggregation || { groupBy: [], aggregations: [] }
  );

  const handleGroupByChange = (field: string) => {
    const groupBy = localAgg.groupBy.includes(field)
      ? localAgg.groupBy.filter(f => f !== field)
      : [...localAgg.groupBy, field];
    setLocalAgg({ ...localAgg, groupBy });
    onChange({ ...localAgg, groupBy });
  };

  const handleAggChange = <T extends keyof AggregationConfig['aggregations'][number]>(idx: number, key: T, value: AggregationConfig['aggregations'][number][T]) => {
    const aggs = localAgg.aggregations.map((agg, i) =>
      i === idx ? { ...agg, [key]: value } : agg
    );
    setLocalAgg({ ...localAgg, aggregations: aggs });
    onChange({ ...localAgg, aggregations: aggs });
  };

  const addAggregation = () => {
    setLocalAgg({ ...localAgg, aggregations: [...localAgg.aggregations, { field: '', function: 'sum' }] });
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, background: '#fff', position: 'fixed', right: 40, top: 200, zIndex: 1000 }}>
      <h3>Aggregation Configuration</h3>
      <button onClick={onClose} style={{ float: 'right' }}>Close</button>
      <div>
        <strong>Group By:</strong>
        {fields.map(f => (
          <label key={f.metadata.name} style={{ marginLeft: 8 }}>
            <input
              type="checkbox"
              checked={localAgg.groupBy.includes(f.metadata.name)}
              onChange={() => handleGroupByChange(f.metadata.name)}
            />
            {f.metadata.label}
          </label>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Aggregations:</strong>
        <button onClick={addAggregation} style={{ marginLeft: 8 }}>Add Aggregation</button>
        <table style={{ width: '100%', marginTop: 8 }}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Function</th>
              <th>Alias</th>
              <th>Custom Function</th>
              <th>Handle Nulls</th>
            </tr>
          </thead>
          <tbody>
            {localAgg.aggregations.map((agg, idx) => (
              <tr key={idx}>
                <td>
                  <select value={agg.field} onChange={e => handleAggChange(idx, 'field', e.target.value)}>
                    <option value="">Select field</option>
                    {fields.map(f => (
                      <option key={f.metadata.name} value={f.metadata.name}>{f.metadata.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select value={agg.function} onChange={e => handleAggChange(idx, 'function', e.target.value as AggregationConfig['aggregations'][number]['function'])}>
                    {aggFuncs.map(fn => (
                      <option key={fn} value={fn}>{fn}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input type="text" value={agg.alias || ''} onChange={e => handleAggChange(idx, 'alias', e.target.value)} />
                </td>
                <td>
                  {agg.function === 'custom' && (
                    <input type="text" value={agg.customFunction || ''} onChange={e => handleAggChange(idx, 'customFunction', e.target.value)} />
                  )}
                </td>
                <td>
                  <select value={agg.handleNulls || 'ignore'} onChange={e => handleAggChange(idx, 'handleNulls', e.target.value as AggregationConfig['aggregations'][number]['handleNulls'])}>
                    <option value="ignore">Ignore</option>
                    <option value="zero">Treat as 0</option>
                    <option value="custom">Custom</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Preview Result Structure:</strong>
        <pre style={{ background: '#f6f6f6', padding: 8 }}>{JSON.stringify(localAgg, null, 2)}</pre>
      </div>
    </div>
  );
};

export default AggregationPanel; 