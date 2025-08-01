import React, { useState, useMemo } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { Company } from '@/api/services/companies';
import EditCompanyDrawer from './components/EditCompanyDrawer';
import CompanyEmployeesDrawer from './components/CompanyEmployeesDrawer';
import ModulesTab from './components/ModulesTab';
import DirectoriesTab from './components/DirectoriesTab';
import AboutTab from './components/AboutTab';

const ACTIVE_COLOR = '#3b82f6';
const INACTIVE_COLOR = '#888';

// Define a type for company with modules
interface CompanyWithModules extends Company {
  modules?: unknown[];
}

const CompanyDetail: React.FC = () => {
  const { t } = useTranslation();
  const { companyId } = useParams<{ companyId: string }>();
  const companies = useAppSelector(state => state.companies.companies) as CompanyWithModules[];
  const company = useMemo(() => companies.find(c => c.id === companyId), [companies, companyId]);
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);

  // Tabs: About, Modules, Directories
  const tabs = [
    {
      label: t('companies.aboutTab', 'About'),
      content: <AboutTab company={company as Company | undefined} onEdit={() => setEditOpen(true)} />,
    },
    {
      label: t('companies.modulesTab', 'Modules'),
      content: <ModulesTab company={company as Company} />,
    },
    {
      label: t('companies.directoriesTab', 'Directories'),
      content: <DirectoriesTab company={company as Company} />,
    },
  ];

  // Prevent tab index out of range
  const safeTab = tab >= tabs.length ? 0 : tab;

  return (
    <Box sx={{ width: '100%', mt: 4, mx: { xs: 1, sm: 3, md: 5 } }}>
      <Paper sx={{ borderRadius: 4, mb: 3, boxShadow: 'none', bgcolor: 'transparent' }}>
        <Tabs
          value={safeTab}
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
          {tabs.map((tabObj, idx) => (
            <Tab
              key={tabObj.label}
              label={tabObj.label}
              sx={{
                textTransform: 'capitalize',
                fontWeight: 600,
                minHeight: 0,
                color: safeTab === idx ? ACTIVE_COLOR : INACTIVE_COLOR,
                letterSpacing: 0.5,
                fontSize: 14,
                px: 0,
                mr: idx < tabs.length - 1 ? 4 : 0,
              }}
            />
          ))}
        </Tabs>
      </Paper>
      {tabs[safeTab].content}
      <EditCompanyDrawer open={editOpen} onClose={() => setEditOpen(false)} company={company as Company | null} />
      <CompanyEmployeesDrawer open={employeesOpen} onClose={() => setEmployeesOpen(false)} companyId={company?.id || null} />
    </Box>
  );
};

export default CompanyDetail; 