import React, { useState } from 'react';
import { DataSource, dataSourcesApi } from '../../../api/services/dataSources';

interface ConnectionTesterProps {
  dataSource: DataSource | null;
  status: 'idle' | 'testing' | 'success' | 'error';
  setStatus: (status: 'idle' | 'testing' | 'success' | 'error') => void;
}

export const ConnectionTester: React.FC<ConnectionTesterProps> = ({ dataSource, status, setStatus }) => {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleTest = async () => {
    if (!dataSource) return;
    setStatus('testing');
    setError(null);
    setSuccessMsg(null);
    try {
      // For now, send the config as-is. In a real app, allow editing config before testing.
      await dataSourcesApi.testConnection(dataSource.id, dataSource.config);
      setStatus('success');
      setSuccessMsg('Connection successful!');
    } catch (err: any) {
      setStatus('error');
      setError(err?.response?.data?.error || err.message || 'Connection failed');
    }
  };

  return (
    <div>
      <h3>Connection Tester</h3>
      <div>Data Source: {dataSource ? dataSource.name : 'None selected'}</div>
      <div>Status: {status}</div>
      {status === 'error' && error && <div style={{ color: 'red' }}>{error}</div>}
      {status === 'success' && successMsg && <div style={{ color: 'green' }}>{successMsg}</div>}
      <button onClick={handleTest} disabled={!dataSource || status === 'testing'}>
        {status === 'testing' ? 'Testing...' : 'Test Connection'}
      </button>
    </div>
  );
}; 