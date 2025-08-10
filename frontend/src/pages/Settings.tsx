import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/store';
import type { Directory } from '@/api/services/types';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const companyDirectories = useSelector((state: RootState) => state.navigation.companyDirectories);
  const systemDirectories = useSelector((state: RootState) => state.navigation.systemDirectories);

  // Type guard for Directory with 'directory_type'
  const hasDirectoryType = (dir: Directory): dir is Directory & { directory_type: string } => 
    typeof (dir as { directory_type?: string }).directory_type === 'string';

  // Filter directories by type
  const systemTypeDirectories = (companyDirectories || []).filter((dir) => 
    hasDirectoryType(dir) && dir.directory_type?.toLowerCase() === 'system'
  );
  
  const companyTypeDirectories = (companyDirectories || []).filter((dir) => 
    hasDirectoryType(dir) && dir.directory_type?.toLowerCase() === 'company'
  );

  // Combine system directories from both sources
  const allSystemDirectories = [...systemDirectories, ...systemTypeDirectories];

  const handleDirectoryClick = (directory: Directory) => {
    if (user && Array.isArray(user.roles) && user.roles.some((role) => role.name === 'super_admin')) {
      // For super admin, navigate without company info
      navigate(`/directories/${directory.id}`);
    } else {
      // For regular users, include company information
      navigate(`/directories/${directory.id}`, {
        state: {
          companyId: user?.company_id,
          companyName: user?.company?.name,
          directoryName: directory.name
        }
      });
    }
  };

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
              {/* System Directories */}
              <Typography variant="h6" gutterBottom sx={{ color: '#1a1e1c', fontWeight: 600 }}>
                {t('settings.systemDirectories', 'System Directories')}
              </Typography>
              <List>
                {allSystemDirectories.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary={t('settings.noSystemDirectories', 'No system directories found.')}
                      primaryTypographyProps={{ color: '#666' }}
                    />
                  </ListItem>
                ) : (
                  allSystemDirectories.map((dir) => (
                    <ListItemButton
                      key={dir.id}
                      onClick={() => handleDirectoryClick(dir)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <ListItemIcon>
                        <Icon 
                          icon={dir.icon_name || 'solar:folder-outline'} 
                          width={24} 
                          height={24}
                          color="#1a1e1c"
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={dir.name}
                        primaryTypographyProps={{ fontWeight: 500, color: '#1a1e1c' }}
                      />
                    </ListItemButton>
                  ))
                )}
              </List>

              <Divider sx={{ my: 3 }} />

              {/* Company Directories */}
              <Typography variant="h6" gutterBottom sx={{ color: '#1a1e1c', fontWeight: 600 }}>
                {t('settings.companyDirectories', 'Company Directories')}
              </Typography>
              <List>
                {companyTypeDirectories.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary={t('settings.noCompanyDirectories', 'No company directories found.')}
                      primaryTypographyProps={{ color: '#666' }}
                    />
                  </ListItem>
                ) : (
                  companyTypeDirectories.map((dir) => (
                    <ListItemButton
                      key={dir.id}
                      onClick={() => handleDirectoryClick(dir)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <ListItemIcon>
                        <Icon 
                          icon={dir.icon_name || 'solar:folder-outline'} 
                          width={24} 
                          height={24}
                          color="#1a1e1c"
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={dir.name}
                        primaryTypographyProps={{ fontWeight: 500, color: '#1a1e1c' }}
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings; 