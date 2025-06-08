import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { Company } from '@/api/services/companies';
import type { Module } from '@/api/services/modules';
import { Icon } from '@iconify/react';
import { RootState } from '@/store';
import { fetchModulesStart, toggleModuleStart } from '@/store/slices/modulesSlice';

interface ModulesTabProps {
  company: Company;
}

const ModulesTab: React.FC<ModulesTabProps> = ({ company }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { modules, loading, error, updating } = useSelector((state: RootState) => state.modules);

  useEffect(() => {
    dispatch(fetchModulesStart(company.id));
  }, [dispatch, company.id]);

  const handleToggleModule = (module: Module) => {
    dispatch(toggleModuleStart({ companyId: company.id, moduleId: module.id }));
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
        {modules.map(module => (
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
                  <Box display="flex" alignItems="center" gap={1}>
                    <Icon icon={module.icon_name} width={20} height={20} />
                    <Typography variant="body2">
                      {module.name}
                    </Typography>
                  </Box>
                  {updating[module.id] && (
                    <CircularProgress size={16} sx={{ ml: 1 }} />
                  )}
                </Box>
              }
            />
          </Box>
        ))}
        {modules.length === 0 && (
          <Typography color="text.secondary" align="center">
            {t('companies.modules.noModules', 'No modules available')}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ModulesTab; 