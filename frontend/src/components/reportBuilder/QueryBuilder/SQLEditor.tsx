import React from 'react';

interface SQLEditorProps {
  dataSource: any;
  query: string;
  setQuery: (query: string) => void;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({ dataSource, query, setQuery }) => {
  return (
    <div>
      <h3>SQL Editor</h3>
      {/* TODO: Implement advanced SQL editor with syntax highlighting, autocomplete, etc. */}
      <div>Data Source: {dataSource ? dataSource.name : 'None selected'}</div>
      <textarea value={query} onChange={e => setQuery(e.target.value)} rows={5} style={{ width: '100%' }} />
    </div>
  );
}; 