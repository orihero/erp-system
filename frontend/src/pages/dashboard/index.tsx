import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Box, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import StatCard from './components/StatCard';
import { usePermissions } from '../../hooks/usePermissions';

interface StatsData {
  totalReceipts: number;
  totalRevenue: number;
  uniqueClients: number;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { check } = usePermissions();

  // Check permissions
  const canViewInventory = check({ requiredType: 'read', entityType: 'directory' });
  const canManageUsers = check({ requiredType: 'read', entityType: 'user' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get<StatsData>('/api/statistics/overview');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="py-6">Loading statistics...</div>;
  if (!stats) return <div className="py-6">No statistics available.</div>;

  return (
    <Box sx={{p: 4, width: '100%'}}>
      <div className="">
        {/* Welcome and Controls Card */}
        <div style={{ width: '100%', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
            {t('common.welcome') || 'Welcome back, Dr.Robert!'} <span style={{ fontSize: 28 }}>🌞</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {canViewInventory && (
              <Button
                variant="contained"
                startIcon={<Icon icon="ph:package" />}
                sx={{
                  borderRadius: 999,
                  textTransform: 'none',
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb' },
                }}
                onClick={() => window.location.href = '/inventory'}
              >
                View Inventory
              </Button>
            )}
            {canManageUsers && (
              <Button
                variant="contained"
                startIcon={<Icon icon="ph:users" />}
                sx={{
                  borderRadius: 999,
                  textTransform: 'none',
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb' },
                }}
                onClick={() => window.location.href = '/users'}
              >
                Manage Users
              </Button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <StatCard
            title="Total patients"
            extra={<a href="#">View more</a>}
            value={stats.uniqueClients}
            icon={
              <div style={{ background: '#e0edff', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="ph:user-bold" width={32} height={32} color="#3b82f6" />
              </div>
            }
          >
            <div style={{ display: 'flex', gap: 48, marginTop: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 32 }}>{stats.totalReceipts}</div>
                <div style={{ fontSize: 18, color: '#3b82f6' }}>Receipts</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 32 }}>{stats.uniqueClients}</div>
                <div style={{ fontSize: 18, color: '#a5b4fc' }}>Unique Clients</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 32 }}>{stats.totalRevenue}</div>
                <div style={{ fontSize: 18, color: '#d1d5db' }}>Revenue</div>
              </div>
            </div>
          </StatCard>
        </div>
      </div>
    </Box>
  );
};

export default Dashboard; 