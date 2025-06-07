import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Company } from '@/api/services/companies';
import { modulesApi, type Module } from '@/api/services/modules';

interface ModulesTabProps {
  company: Company;
}

const ModulesTab: React.FC<ModulesTabProps> = ({ company }) => {
  const { t } = useTranslation();
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [companyModules, setCompanyModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const [allModulesRes, companyModulesRes] = await Promise.all([
          modulesApi.getAllModules(),
          modulesApi.getCompanyModules(company.id)
        ]);

        // Merge the data to show all modules with their enabled status
        const mergedModules = allModulesRes.data.map(module => {
          const companyModule = companyModulesRes.data.find(cm => cm.id === module.id);
          return {
            ...module,
            is_enabled: companyModule?.is_enabled || false
          };
        });

        setAllModules(mergedModules);
        setCompanyModules(companyModulesRes.data);
        setError(null);
      } catch (err) {
        setError(t('companies.modules.error', 'Failed to load modules'));
        console.error('Error loading modules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [company.id, t]);

  const handleToggleModule = async (module: Module) => {
    try {
      setUpdating(prev => ({ ...prev, [module.id]: true }));
      const response = await modulesApi.toggleModule(company.id, module.id);
      
      // Update the module's enabled status in the local state
      setAllModules(prev => prev.map(m => 
        m.id === module.id 
          ? { ...m, is_enabled: response.data.is_enabled }
          : m
      ));

      // Update company modules list
      if (response.data.is_enabled) {
        setCompanyModules(prev => [...prev, { ...module, is_enabled: true }]);
      } else {
        setCompanyModules(prev => prev.filter(m => m.id !== module.id));
      }
    } catch (err) {
      setError(t('companies.modules.toggleError', 'Failed to toggle module'));
      console.error('Error toggling module:', err);
    } finally {
      setUpdating(prev => ({ ...prev, [module.id]: false }));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h6" mb={3}>
        {t('companies.modules.title', 'Modules')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        {allModules.map(module => (
          <Box key={module.id} mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={module.is_enabled}
                  onChange={() => handleToggleModule(module)}
                  disabled={updating[module.id]}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <Chip
                    icon={<i className={`fas fa-${module.icon_name}`} />}
                    label={module.name}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {updating[module.id] && (
                    <CircularProgress size={16} sx={{ ml: 1 }} />
                  )}
                </Box>
              }
            />
          </Box>
        ))}
        {allModules.length === 0 && (
          <Typography color="text.secondary" align="center">
            {t('companies.modules.noModules', 'No modules available')}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ModulesTab; 