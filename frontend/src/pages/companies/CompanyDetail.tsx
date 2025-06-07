import React, { useState, useMemo } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import EditCompanyDrawer from './components/EditCompanyDrawer';
import CompanyEmployeesDrawer from './components/CompanyEmployeesDrawer';
import ModulesTab from './components/ModulesTab';
import DirectoriesTab from './components/DirectoriesTab';
import CompanyEmployeesTable from './components/CompanyEmployeesTable';
import AboutTab from './components/AboutTab';

const ACTIVE_COLOR = '#3b82f6';
const INACTIVE_COLOR = '#888';

const CompanyDetail: React.FC = () => {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const companies = useAppSelector(state => state.companies.companies);
  const company = useMemo(() => companies.find(c => c.id === companyId), [companies, companyId]);
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);

  return (
    <Box sx={{ width: '100%', mt: 4, mx: { xs: 1, sm: 3, md: 5 } }}>
      <Paper sx={{ borderRadius: 4, mb: 3, boxShadow: 'none', bgcolor: 'transparent' }}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          TabIndicatorProps={{
            style: {
              backgroundColor: ACTIVE_COLOR,
              height: 2,
              borderRadius: 2,
            },
          }}
          sx={{
            minHeight: 0,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Tab
            label={t('companies.aboutTab', 'About')}
            sx={{
              textTransform: 'capitalize',
              fontWeight: 600,
              minHeight: 0,
              color: tab === 0 ? ACTIVE_COLOR : INACTIVE_COLOR,
              letterSpacing: 0.5,
              fontSize: 14,
              px: 0,
              mr: 4,
            }}
          />
          <Tab
            label={t('companies.modulesTab', 'Modules')}
            sx={{
              textTransform: 'capitalize',
              fontWeight: 600,
              minHeight: 0,
              color: tab === 1 ? ACTIVE_COLOR : INACTIVE_COLOR,
              letterSpacing: 0.5,
              fontSize: 14,
              px: 0,
              mr: 4,
            }}
          />
          <Tab
            label={t('companies.directoriesTab', 'Directories')}
            sx={{
              textTransform: 'capitalize',
              fontWeight: 600,
              minHeight: 0,
              color: tab === 2 ? ACTIVE_COLOR : INACTIVE_COLOR,
              letterSpacing: 0.5,
              fontSize: 14,
              px: 0,
            }}
          />
        </Tabs>
      </Paper>
      {tab === 0 && (
        <AboutTab company={company!} onEdit={() => setEditOpen(true)} />
      )}
      {tab === 1 && <ModulesTab company={company!} />}
      {tab === 2 && <DirectoriesTab company={company!} />}
      <EditCompanyDrawer open={editOpen} onClose={() => setEditOpen(false)} company={company || null} />
      <CompanyEmployeesDrawer open={employeesOpen} onClose={() => setEmployeesOpen(false)} companyId={company?.id || null} />
    </Box>
  );
};

export default CompanyDetail; 