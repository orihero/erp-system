import React from 'react';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, extra, icon, children }) => (
  <div
    style={{
      flex: 1,
      minWidth: 420,
      minHeight: 340,
      background: '#fff',
      borderRadius: 32,
      padding: 48,
      margin: 24,
      boxShadow: '0 4px 32px 0 rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      position: 'relative',
    }}
  >
    {/* Icon illustration */}
    {icon && (
      <div style={{ position: 'absolute', top: 32, left: 32 }}>{icon}</div>
    )}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: icon ? 0 : 16 }}>
      <span style={{ fontWeight: 700, fontSize: 24, marginLeft: icon ? 64 : 0 }}>{title}</span>
      {extra && <span style={{ color: '#3b82f6', fontWeight: 500, fontSize: 18 }}>{extra}</span>}
    </div>
    <div style={{ fontSize: 64, fontWeight: 800, marginBottom: 16, marginLeft: icon ? 64 : 0 }}>{value}</div>
    <div style={{ marginLeft: icon ? 64 : 0 }}>{children}</div>
  </div>
);

export default StatCard; 