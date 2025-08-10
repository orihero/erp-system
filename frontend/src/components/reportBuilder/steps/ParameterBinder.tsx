import React from 'react';

interface ParameterBinderProps {
  query: string;
  parameters: any[];
  setParameters: (params: any[]) => void;
}

export const ParameterBinder: React.FC<ParameterBinderProps> = ({ query, parameters, setParameters }) => {
  return (
    <div>
      <h3>Parameter Binder</h3>
      {/* TODO: Implement parameter binding UI */}
      <div>Query: {query}</div>
      <div>Parameters: {JSON.stringify(parameters)}</div>
      <button onClick={() => setParameters([{ name: 'param1', type: 'string' }])}>Set Demo Parameter</button>
    </div>
  );
}; 