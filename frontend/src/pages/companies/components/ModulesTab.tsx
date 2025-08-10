import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Collapse,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { Icon } from '@iconify/react';
import { RootState } from '@/store';
import { Module } from '@/api/services/modules';
import { CompanyModuleDirectory } from '@/store/slices/companyModuleDirectoriesSlice';
import { fetchCompanyModuleDirectoriesStart } from '@/store/slices/companyModuleDirectoriesSlice';
import { bindDirectoriesToModule } from '@/store/slices/companyDirectoriesSlice';
import { toggleModuleStart } from '@/store/slices/modulesSlice';
import { fetchDirectoriesStart } from '@/store/slices/directoriesSlice';
import BindDirectoryDrawer from './BindDirectoryDrawer';

interface ModulesTabProps {
  company: {
    id: string;
    name: string;
  };
}

interface ExtendedModule extends Module {
  company_module_id?: string;
  is_enabled: boolean;
}

const ModulesTab: React.FC<ModulesTabProps> = ({ company }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { modules, directoriesByModule, loading, error } = useSelector((state: RootState) => state.companyModuleDirectories);
  const { directories: allDirectories } = useSelector((state: RootState) => state.directories);
  const [selectedModule, setSelectedModule] = useState<ExtendedModule | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  console.log("Modules", { modules })

  useEffect(() => {
    dispatch(fetchCompanyModuleDirectoriesStart(company.id));
    dispatch(fetchDirectoriesStart());
  }, [dispatch, company.id]);

  const handleBindDirectories = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId) as ExtendedModule | undefined;
    if (module) {
      setSelectedModule(module);
      setIsDrawerVisible(true);
    }
  };

  const handleBindSubmit = (directoryIds: string[]) => {
    if (selectedModule?.company_module_id) {
      console.log('Binding directories to module:', {
        companyId: company.id,
        companyModuleId: selectedModule.company_module_id,
        directoryIds
      });
      dispatch(bindDirectoriesToModule({
        companyId: company.id,
        companyModuleId: selectedModule.company_module_id,
        directoryIds
      }));
      // Refresh the module directories data after binding
      console.log('Refreshing module directories data for company:', company.id);
      dispatch(fetchCompanyModuleDirectoriesStart(company.id));
    }
    setIsDrawerVisible(false);
  };

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleModuleToggle = (module: ExtendedModule) => {
    dispatch(toggleModuleStart({
      companyId: company.id,
      moduleId: module.id
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box p={3}>
      <Typography variant="h6" mb={3}>
        {t('companies.modules.title', 'Modules')}
      </Typography>
      <Paper sx={{ p: 2 }}>
        {(modules as ExtendedModule[]).map((module: ExtendedModule) => (
          <Box key={module.id} mb={2}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                cursor: 'pointer'
              }}
              onClick={() => toggleModuleExpand(module.id)}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton size="small">
                  <Icon
                    icon={expandedModules[module.id] ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                    width={20}
                    height={20}
                  />
                </IconButton>
                <Icon icon={module.icon_name} width={20} height={20} />
                <Typography variant="h6">{module.name}</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={module.is_enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleModuleToggle(module);
                    }}
                  />
                }
                label={module.is_enabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
            <Collapse in={expandedModules[module.id]}>
              <Box ml={4} mt={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">{t('companies.directories.title', 'Directories')}</Typography>
                  {module.is_enabled && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Icon icon="mdi:plus" />}
                      onClick={() => handleBindDirectories(module.id)}
                    >
                      {t('companies.bindDirectories', 'Bind Directories')}
                    </Button>
                  )}
                </Box>
                <List dense>
                  {directoriesByModule[module.id]?.map((directory: CompanyModuleDirectory) => (
                    <ListItem key={directory.id}>
                      <ListItemIcon>
                        <Icon icon={directory.icon_name || 'mdi:folder'} width={18} height={18} />
                      </ListItemIcon>
                      <ListItemText primary={directory.name} />
                    </ListItem>
                  ))}
                  {(!directoriesByModule[module.id] || directoriesByModule[module.id].length === 0) && (
                    <ListItem>
                      <ListItemText
                        primary={t('companies.modules.noDirectories', 'No directories bound to this module')}
                        sx={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Collapse>
          </Box>
        ))}
        {modules.length === 0 && (
          <Typography color="text.secondary" align="center">
            {t('companies.modules.noModules', 'No modules available')}
          </Typography>
        )}
      </Paper>

      <BindDirectoryDrawer
        open={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        module={selectedModule}
        boundDirectories={selectedModule ? directoriesByModule[selectedModule.id] || [] : []}
        allDirectories={allDirectories}
        onBind={handleBindSubmit}
      />
    </Box>
  );
};

export default ModulesTab;
