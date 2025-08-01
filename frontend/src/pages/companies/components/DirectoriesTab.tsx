import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { Company } from '@/api/services/companies';
import type { Directory } from '@/api/services/directories';
import { RootState } from '@/store';
import {
  fetchCompanyDirectories
} from '@/store/slices/companyDirectoriesSlice';

interface DirectoriesTabProps {
  company: Company;
}

const DirectoriesTab: React.FC<DirectoriesTabProps> = ({ company }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    allDirectories,
    loading,
    error
  } = useSelector((state: RootState) => state.companyDirectories);

  useEffect(() => {
    dispatch(fetchCompanyDirectories({ companyId: company.id }));
  }, [company.id, dispatch]);

  // Filter to show only enabled directories
  const enabledDirectories = allDirectories.filter(directory => directory.is_enabled);

  const handleDirectoryClick = (directory: Directory) => {
    // Navigate to directory records page
    navigate(`/directories/${directory.id}`, {
      state: { 
        companyId: company.id,
        companyName: company.name,
        directoryName: directory.name
      }
    });
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {t('companies.directories.title', 'Directories')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {enabledDirectories.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('companies.directories.noEnabledDirectoriesInfo', 'No enabled directories are currently available. Enable modules and directories in the Modules tab to see available directories.')}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('companies.directories.name', 'Name')}</TableCell>
              <TableCell>{t('companies.directories.icon', 'Icon')}</TableCell>
              <TableCell>{t('companies.directories.type', 'Type')}</TableCell>
              <TableCell>{t('companies.directories.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enabledDirectories.map((directory) => (
              <TableRow 
                key={directory.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleDirectoryClick(directory)}
              >
                <TableCell>{directory.name}</TableCell>
                <TableCell>
                  <Chip
                    icon={<i className={`fas fa-${directory.icon_name}`} />}
                    label={directory.icon_name}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={directory.directory_type || 'Module'}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectoryClick(directory);
                    }}
                  >
                    <Icon icon="mdi:eye" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {enabledDirectories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t('companies.directories.noEnabledDirectories', 'No enabled directories found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DirectoriesTab; 