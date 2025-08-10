import React from 'react';
import {
  Box,
  Typography,
  Icon
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CompanyDirectoryResponse } from '@/api/services/companyDirectories';
import type { Directory } from '@/api/services/directories';
import { useCompanyDirectories } from '@/hooks/useCompanyDirectories';

interface SelectDirectoryStepProps {
  companyId: string;
  selectedDirectory: Directory | null;
  onDirectorySelect: (directory: Directory) => void;
}

const SelectDirectoryStep: React.FC<SelectDirectoryStepProps> = ({
  companyId,
  selectedDirectory,
  onDirectorySelect
}) => {
  const { t } = useTranslation();
  
  // Fetch company directories
  const { data: directories, isLoading, error } = useCompanyDirectories(companyId);

  const handleDirectorySelect = (directory: CompanyDirectoryResponse) => {
    onDirectorySelect({
      id: directory.directory.id,
      name: directory.directory.name,
      icon_name: directory.directory.icon_name || '',
      directory_type: directory.directory.directory_type,
      created_at: directory.created_at,
      updated_at: directory.updated_at
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('wizard.selectDirectoryTitle', 'Select a directory to use as data source')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('wizard.selectDirectoryDescription', 'Choose a directory that contains the data you want to include in your report')}
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>{t('common.loading', 'Loading...')}</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography color="error">{t('common.error', 'Error loading directories')}</Typography>
        </Box>
      ) : directories && directories.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
          {directories.map((directory) => {
            const isSelected = selectedDirectory?.id === directory.directory.id;
            
            return (
              <Box
                key={directory.id}
                onClick={() => handleDirectorySelect(directory)}
                sx={{
                  p: 2,
                  border: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderColor: isSelected ? 'primary.main' : 'grey.300',
                  backgroundColor: isSelected ? 'primary.main' : 'background.paper',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: isSelected ? 'primary.dark' : 'primary.50',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Icon 
                    icon={directory.directory.icon_name || "mdi:folder"} 
                    style={{ 
                      fontSize: '32px', 
                      color: isSelected ? '#ffffff' : '#3b82f6' 
                    }} 
                  />
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: isSelected ? 'bold' : 'normal',
                        color: isSelected ? '#ffffff' : 'inherit'
                      }}
                    >
                      {directory.directory.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'
                      }}
                    >
                      {directory.directory.directory_type || 'Directory'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Icon 
            icon="mdi:folder-off" 
            style={{ fontSize: '64px', color: '#9ca3af', marginBottom: '16px' }} 
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('wizard.noDirectories', 'No directories available')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('wizard.noDirectoriesDescription', 'This company has no directories bound to it yet.')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SelectDirectoryStep; 