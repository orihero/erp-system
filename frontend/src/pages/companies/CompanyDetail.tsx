import React, { useState, useMemo, useEffect } from 'react';
import { Box, Tabs, Tab, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCompaniesStart } from '@/store/slices/companiesSlice';
import type { Company } from '@/api/services/companies';
import EditCompanyDrawer from './components/EditCompanyDrawer';
import CompanyEmployeesDrawer from './components/CompanyEmployeesDrawer';
import ModulesTab from './components/ModulesTab';
import DirectoriesTab from './components/DirectoriesTab';
import AboutTab from './components/AboutTab';
import ReportsTab from './components/ReportsTab';

const ACTIVE_COLOR = '#3b82f6';
const INACTIVE_COLOR = '#888';

// Define a type for company with modules
interface CompanyWithModules extends Company {
  modules?: unknown[];
}

const CompanyDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId, tab: urlTab } = useParams<{ companyId: string; tab?: string }>();
  const dispatch = useAppDispatch();
  
  const companies = useAppSelector(state => state.companies.companies) as CompanyWithModules[];
  const loading = useAppSelector(state => state.companies.loading);
  const company = useMemo(() => companies.find(c => c.id === companyId), [companies, companyId]);
  
  const [editOpen, setEditOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);

  // Load companies if not already loaded
  useEffect(() => {
    if (companies.length === 0 && !loading) {
      dispatch(fetchCompaniesStart());
    }
  }, [companies.length, loading, dispatch]);

  // Map tab names to indices
  const tabMap = {
    'about': 0,
    'modules': 1,
    'directories': 2,
    'reports': 3
  };

  // Determine current tab from URL or default to 0
  const currentTab = useMemo(() => {
    if (urlTab && tabMap[urlTab as keyof typeof tabMap] !== undefined) {
      return tabMap[urlTab as keyof typeof tabMap];
    }
    return 0;
  }, [urlTab]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tabNames = ['about', 'modules', 'directories', 'reports'];
    const newTabName = tabNames[newValue];
    navigate(`/companies/${companyId}/${newTabName}`, { replace: true });
  };

  // Redirect to default tab if no tab is specified
  useEffect(() => {
    if (company && !urlTab && location.pathname === `/companies/${companyId}`) {
      navigate(`/companies/${companyId}/about`, { replace: true });
    }
  }, [company, urlTab, companyId, navigate, location.pathname]);

  // Tabs: About, Modules, Directories, Reports
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
    {
      label: t('companies.reportsTab', 'Reports'),
      content: <ReportsTab company={company as Company | undefined} />,
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ 
        width: '100%', 
        mt: 4, 
        mx: { xs: 1, sm: 3, md: 5 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if company not found
  if (!company) {
    return (
      <Box sx={{ 
        width: '100%', 
        mt: 4, 
        mx: { xs: 1, sm: 3, md: 5 }
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('companies.notFound', 'Company not found')}
        </Alert>
        <Typography variant="body1" color="text.secondary">
          {t('companies.notFoundMessage', 'The company you are looking for does not exist or you do not have permission to view it.')}
        </Typography>
      </Box>
    );
  }

  // Prevent tab index out of range
  const safeTab = currentTab >= tabs.length ? 0 : currentTab;

  return (
    <Box sx={{ width: '100%', mt: 4, mx: { xs: 1, sm: 3, md: 5 } }}>
      <Paper sx={{ borderRadius: 4, mb: 3, boxShadow: 'none', bgcolor: 'transparent' }}>
        <Tabs
          value={safeTab}
          onChange={handleTabChange}
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