import React, { useEffect, useState } from 'react';
import { dataSourcesApi, DataSource } from '../../../api/services/dataSources';

interface DataSourceSelectorProps {
  selectedSource: DataSource | null;
  onSelect: (source: DataSource) => void;
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ selectedSource, onSelect }) => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    dataSourcesApi.getAll()
      .then(res => {
        setSources(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load data sources');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h3>Data Source Selection</h3>
      {loading && <div>Loading data sources...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {sources.map(source => (
          <li key={source.id} style={{ margin: '8px 0' }}>
            <button
              style={{
                fontWeight: selectedSource?.id === source.id ? 'bold' : 'normal',
                background: selectedSource?.id === source.id ? '#e0e0e0' : undefined,
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid #ccc',
                cursor: 'pointer',
              }}
              onClick={() => onSelect(source)}
            >
              {source.name} <span style={{ fontSize: 12, color: '#888' }}>({source.type})</span>
            </button>
          </li>
        ))}
      </ul>
      {!loading && sources.length === 0 && <div>No data sources available.</div>}
    </div>
  );
}; 