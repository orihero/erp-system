import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Box, Button, IconButton, InputBase, Paper } from '@mui/material';
import { Icon } from '@iconify/react';
import StatCard from './components/StatCard';

interface TopTreatment {
  product_name: string;
  count: number;
}

interface StatsData {
  totalReceipts: number;
  totalRevenue: number;
  uniqueClients: number;
  topTreatments: TopTreatment[];
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/statistics/overview').then(res => {
      setStats(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-6">Loading statistics...</div>;
  if (!stats) return <div className="py-6">No statistics available.</div>;

  const topTreatments = stats.topTreatments || [];

  return (
   <Box sx={{p: 4, width: '100%'}}>
      <div className="">
        {/* Welcome and Controls Card */}
        <div style={{ width: '100%', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
            {t('common.welcome') || 'Welcome back, Dr.Robert!'} <span style={{ fontSize: 28 }}>🌞</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Paper component="form" sx={{ display: 'flex', alignItems: 'center', borderRadius: 999, boxShadow: 'none', bgcolor: '#fff', py: 0.5, minWidth: 200, pl: 2, pr: .5 }}>
              <InputBase sx={{ ml: 1, flex: 1, fontSize: 16 }} placeholder="Search..." endAdornment={<IconButton size="medium" sx={{ color: '#222', bgcolor: 'transparent' }}><Icon icon="ep:search" width={24} height={24} /></IconButton>} />
            </Paper>
            <Button variant="outlined" endIcon={<Icon icon="solar:calendar-outline" width={22} height={22} />} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 500, fontSize: 16, bgcolor: '#fff', borderColor: '#ececec', color: '#222', pl: 3, height: 48, '&:hover': { bgcolor: '#f6f7fb' }, pr: 1 }}>
              Monthly
            </Button>
            <Button variant="outlined" endIcon={<Icon icon="hugeicons:download-01" width={22} height={22} />} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 500, fontSize: 16, bgcolor: '#fff', borderColor: '#ececec', color: '#222', pl: 3, height: 48, '&:hover': { bgcolor: '#f6f7fb', }, pr: 1 }}>
              Export data
            </Button>
          </div>
        </div>
        {/* Statistics widgets */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Top Treatment Card */}
          <StatCard
            title="Top treatment"
            extra={<a href="#">View more</a>}
            value={topTreatments[0]?.count || 0}
            icon={
              <div style={{ background: '#e0edff', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="ph:tooth-bold" width={32} height={32} color="#3b82f6" />
              </div>
            }
          >
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              {topTreatments.map((t, idx) => (
                <div key={t.product_name} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 48 + idx * 24,
                    height: 48 + idx * 24,
                    borderRadius: '50%',
                    background: ['#3b82f6', '#a5b4fc', '#d1d5db', '#bae6fd'][idx] || '#e5e7eb',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                    margin: '0 auto',
                  }}>{t.count}</div>
                  <div style={{ fontSize: 13, color: '#222', marginTop: 4 }}>{t.product_name}</div>
                </div>
              ))}
            </div>
          </StatCard>
          {/* Satisfaction Rate Card (mocked) */}
          <StatCard
            title="Satisfaction rate"
            extra={<a href="#">View more</a>}
            value={<span>85% <span style={{ color: '#ef4444', fontSize: 24, marginLeft: 8 }}>-2%</span></span>}
            icon={
              <div style={{ background: '#e0edff', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="ph:smiley-bold" width={32} height={32} color="#3b82f6" />
              </div>
            }
          >
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <svg width="220" height="80" viewBox="0 0 220 80">
                {/* Gauge background */}
                <path d="M30,75 A80,80 0 0,1 190,75" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                {/* Gauge value */}
                <path d="M30,75 A80,80 0 0,1 170,45" fill="none" stroke="#3b82f6" strokeWidth="16" />
                {/* Needle */}
                <line x1="110" y1="75" x2="170" y2="45" stroke="#222" strokeWidth="6" />
              </svg>
            </div>
          </StatCard>
          {/* Total Patients Card */}
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