import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Directory } from '@/api/services/directories';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue);
  const companyDirectories = useSelector((state: RootState) => state.companyDirectories.companyDirectories);
  const systemDirectories: Directory[] = companyDirectories.filter(
    (dir) => dir.is_enabled && dir.directory_type?.toLowerCase() === 'system'
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 4, p: 3 }}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label={t('settings.profileTab', 'Profile')} />
          <Tab label={t('settings.directoriesTab', 'Directories')} />
        </Tabs>
        <Box sx={{ mt: 3 }}>
          {tab === 0 && (
            <Typography variant="h6">{t('settings.profileTab', 'Profile')}</Typography>
          )}
          {tab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>{t('settings.systemDirectories', 'System Directories')}</Typography>
              <List>
                {systemDirectories.length === 0 && (
                  <ListItem>
                    <ListItemText primary={t('settings.noSystemDirectories', 'No system directories found.')} />
                  </ListItem>
                )}
                {systemDirectories.map((dir) => (
                  <ListItem key={dir.id}>
                    <ListItemIcon>
                      <Icon icon={dir.icon_name || 'solar:folder-outline'} width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText primary={dir.name} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings; 