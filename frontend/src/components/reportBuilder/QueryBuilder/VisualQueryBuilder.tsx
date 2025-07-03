import React from 'react';

interface VisualQueryBuilderProps {
  dataSource: any;
  query: string;
  setQuery: (query: string) => void;
}

export const VisualQueryBuilder: React.FC<VisualQueryBuilderProps> = ({ dataSource, query, setQuery }) => {
  return (
    <div>
      <h3>Visual Query Builder</h3>
      {/* TODO: Implement drag-and-drop visual query builder */}
      <div>Data Source: {dataSource ? dataSource.name : 'None selected'}</div>
      <div>Query: {query}</div>
      <button onClick={() => setQuery('SELECT * FROM demo_table')}>Set Demo Query</button>
    </div>
  );
}; 