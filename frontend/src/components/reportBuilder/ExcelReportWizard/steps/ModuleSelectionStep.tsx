import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { modulesApi, type Module } from '@/api/services/modules';
import type { ExcelReportData } from '../ExcelReportWizard';

interface ModuleSelectionStepProps {
  data: ExcelReportData;
  companyId: string;
  onDataChange: (data: Partial<ExcelReportData>) => void;
}

interface ExtendedModule extends Module {
  is_enabled: boolean;
}

export const ModuleSelectionStep: React.FC<ModuleSelectionStepProps> = ({
  data,
  companyId,
  onDataChange
}) => {
  const { t } = useTranslation();
  const [modules, setModules] = useState<ExtendedModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyModules();
  }, [companyId]);

  const loadCompanyModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [allModulesRes, companyModulesRes] = await Promise.all([
        modulesApi.getAll(),
        modulesApi.getCompanyModules(companyId)
      ]);

      // Merge the data to show all modules with their enabled status
      const mergedModules = allModulesRes.data.map((module: Module) => {
        const companyModule = companyModulesRes.data.find(
          (cm: any) => cm.module && cm.module.id === module.id
        );
        return {
          ...module,
          is_enabled: companyModule?.is_enabled || false,
        };
      });

      // Only show enabled modules
      const enabledModules = mergedModules.filter(module => module.is_enabled);
      setModules(enabledModules);
    } catch (err) {
      console.error('Error loading company modules:', err);
      setError(t('reports.wizard.errorLoadingModules', 'Failed to load company modules'));
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    const currentSelected = data.selectedModules || [];
    const newSelected = currentSelected.includes(moduleId)
      ? currentSelected.filter(id => id !== moduleId)
      : [...currentSelected, moduleId];
    
    onDataChange({ selectedModules: newSelected });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (modules.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Icon 
          icon="mdi:puzzle-outline" 
          style={{ fontSize: '64px', color: '#9ca3af', marginBottom: '16px' }} 
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('reports.wizard.noModulesAvailable', 'No modules available')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('reports.wizard.noModulesDescription', 'This company has no enabled modules. Please enable modules in the company settings first.')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        {t('reports.wizard.selectModules', 'Select Modules for Report')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('reports.wizard.modulesDescription', 'Choose which modules to include in your Excel report. The report will include data from the selected modules.')}
      </Typography>

      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <FormGroup>
          {modules.map((module) => (
            <Card 
              key={module.id} 
              variant="outlined" 
              sx={{ 
                mb: 2,
                borderColor: (data.selectedModules || []).includes(module.id) ? '#3b82f6' : '#e5e7eb',
                backgroundColor: (data.selectedModules || []).includes(module.id) ? '#f0f9ff' : 'transparent'
              }}
            >
              <CardContent sx={{ py: 2, px: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={(data.selectedModules || []).includes(module.id)}
                      onChange={() => handleModuleToggle(module.id)}
                      sx={{
                        color: '#6b7280',
                        '&.Mui-checked': {
                          color: '#3b82f6',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Icon icon={module.icon_name} style={{ fontSize: '20px', color: '#6b7280' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {module.name}
                      </Typography>
                      <Chip
                        label={t('common.enabled', 'Enabled')}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  }
                  sx={{ 
                    width: '100%',
                    margin: 0,
                    '& .MuiFormControlLabel-label': {
                      width: '100%'
                    }
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </FormGroup>
      </FormControl>

      {(data.selectedModules || []).length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('reports.wizard.selectedModules', 'Selected Modules')}:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {modules
              .filter(module => (data.selectedModules || []).includes(module.id))
              .map(module => (
                <Chip
                  key={module.id}
                  icon={<Icon icon={module.icon_name} />}
                  label={module.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
