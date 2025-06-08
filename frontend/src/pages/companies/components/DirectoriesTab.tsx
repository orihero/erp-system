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
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { Company } from '@/api/services/companies';
import type { Directory } from '@/api/services/directories';
import { RootState } from '@/store';
import {
  fetchCompanyDirectories,
  toggleCompanyDirectory
} from '@/store/slices/companyDirectoriesSlice';

interface DirectoriesTabProps {
  company: Company;
}

const DirectoriesTab: React.FC<DirectoriesTabProps> = ({ company }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    allDirectories,
    loading,
    error,
    updating
  } = useSelector((state: RootState) => state.companyDirectories);

  useEffect(() => {
    dispatch(fetchCompanyDirectories({ companyId: company.id }));
  }, [company.id, dispatch]);

  const handleToggleDirectory = (directory: Directory) => {
    const isEnabled = !directory.is_enabled;
    dispatch(toggleCompanyDirectory({
      companyId: company.id,
      directory,
      isEnabled
    }));
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('companies.directories.name', 'Name')}</TableCell>
              <TableCell>{t('companies.directories.icon', 'Icon')}</TableCell>
              <TableCell>{t('companies.directories.status', 'Status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allDirectories.map((directory) => (
              <TableRow key={directory.id}>
                <TableCell>{directory.name}</TableCell>
                <TableCell>
                  <Chip
                    icon={<i className={`fas fa-${directory.icon_name}`} />}
                    label={directory.icon_name}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={directory.is_enabled}
                        onChange={() => handleToggleDirectory(directory)}
                        disabled={updating[directory.id]}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <Chip
                          label={directory.is_enabled ? t('companies.directories.active', 'Active') : t('companies.directories.inactive', 'Inactive')}
                          color={directory.is_enabled ? 'success' : 'default'}
                          size="small"
                        />
                        {updating[directory.id] && (
                          <CircularProgress size={16} sx={{ ml: 1 }} />
                        )}
                      </Box>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
            {allDirectories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {t('companies.directories.noDirectories', 'No directories found')}
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