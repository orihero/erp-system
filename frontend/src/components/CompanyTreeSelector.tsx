import React, { useEffect, useState } from 'react';
import { companiesApi, CompanyTreeNode } from '../api/services/companies';

interface CompanyTreeSelectorProps {
  selectedCompanyId?: string;
  onSelect: (companyId: string) => void;
}

const CompanyTreeSelector: React.FC<CompanyTreeSelectorProps> = ({ selectedCompanyId, onSelect }) => {
  const [tree, setTree] = useState<CompanyTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    companiesApi.getCompanyHierarchy()
      .then(res => setTree(res.data))
      .catch(() => setError('Failed to load company hierarchy'))
      .then(() => setLoading(false));
  }, []);

  const renderTree = (nodes: CompanyTreeNode[], depth = 0) => (
    <ul style={{ listStyle: 'none', paddingLeft: depth * 16 }}>
      {nodes.map(node => (
        <li key={node.id}>
          <div
            style={{
              padding: '4px 8px',
              margin: '2px 0',
              border: node.parent_company_id ? '1px solid #ccc' : '2px solid #1976d2',
              borderRadius: 4,
              background: node.id === selectedCompanyId ? '#e3f2fd' : '#fff',
              cursor: 'pointer',
              fontWeight: node.parent_company_id ? 'normal' : 'bold',
            }}
            onClick={() => onSelect(node.id)}
          >
            {node.name}
          </div>
          {node.children && node.children.length > 0 && renderTree(node.children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  if (loading) return <div>Loading company hierarchy...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h4>Select Company</h4>
      {renderTree(tree)}
    </div>
  );
};

export default CompanyTreeSelector; 