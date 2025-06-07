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
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
    companyDirectories,
    loading,
    error,
    updating
  } = useSelector((state: RootState) => state.companyDirectories);

  useEffect(() => {
    dispatch(fetchCompanyDirectories({ companyId: company.id }));
  }, [company.id, dispatch]);

  const handleToggleDirectory = (directory: Directory) => {
    const isEnabled = !companyDirectories.some(cd => cd.id === directory.id);
    dispatch(toggleCompanyDirectory({
      companyId: company.id,
      directory,
      isEnabled
    }));
  };

  const handleAddDirectory = () => {
    // TODO: Implement add directory functionality
    console.log('Add directory clicked');
  };

  const handleEditDirectory = (directory: Directory) => {
    // TODO: Implement edit directory functionality
    console.log('Edit directory clicked:', directory);
  };

  const handleDeleteDirectory = async (directory: Directory) => {
    // TODO: Implement delete directory functionality
    console.log('Delete directory clicked:', directory);
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDirectory}
        >
          {t('companies.directories.add', 'Add Directory')}
        </Button>
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
              <TableCell align="right">
                {t('companies.directories.actions', 'Actions')}
              </TableCell>
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
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleEditDirectory(directory)}
                    sx={{ mr: 1 }}
                    disabled={!directory.is_enabled}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteDirectory(directory)}
                    color="error"
                    disabled={!directory.is_enabled}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {allDirectories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
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