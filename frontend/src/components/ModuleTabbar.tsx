import React from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { setCurrentModule } from '@/store/slices/navigationSlice';
import { useTranslation } from 'react-i18next';

const ModuleTabbar: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const modules = useSelector((state: RootState) => state.navigation.modules);
  const currentModule = useSelector((state: RootState) => state.navigation.currentModule);
  const user = useSelector((state: RootState) => state.auth.user);

  // Only show tabbar for non-super admin users with multiple modules
  if (!user || user.roles?.some(role => role.name === 'super_admin') || modules.length <= 1) {
    return null;
  }

  const handleModuleChange = (event: React.SyntheticEvent, newValue: string) => {
    const selectedModule = modules.find(module => module.id === newValue);
    if (selectedModule) {
      dispatch(setCurrentModule(selectedModule));
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 80, // Below the header
      left: 0,
      right: 0,
      zIndex: 9,
      borderBottom: 1, 
      borderColor: 'divider',
      bgcolor: 'background.paper',
      px: 2
    }}>
      <Tabs 
        value={currentModule?.id || modules[0]?.id || ''} 
        onChange={handleModuleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
              fontWeight: 600,
            },
          },
        }}
      >
        {modules.map((module) => (
          <Tab
            key={module.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {module.icon_name && (
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* You can add an icon here if needed */}
                  </Box>
                )}
                <Typography variant="body2">
                  {module.name}
                </Typography>
              </Box>
            }
            value={module.id}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default ModuleTabbar;
