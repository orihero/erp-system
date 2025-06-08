import React, { useEffect, useState } from 'react';
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
  IconButton,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchModulesStart, updateModuleStart } from '@/store/slices/modulesSlice';
import type { Module } from '@/api/services/modules';
import { Icon } from '@iconify/react';

const Modules: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { modules, loading, error } = useSelector((state: RootState) => state.modules);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [iconName, setIconName] = useState('');

  useEffect(() => {
    dispatch(fetchModulesStart());
  }, [dispatch]);

  const handleEditIcon = (module: Module) => {
    setSelectedModule(module);
    setIconName(module.icon_name);
  };

  const handleCloseDialog = () => {
    setSelectedModule(null);
    setIconName('');
  };

  const handleSaveIcon = () => {
    if (selectedModule && iconName) {
      dispatch(updateModuleStart({
        moduleId: selectedModule.id,
        data: { icon_name: iconName }
      }));
      handleCloseDialog();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          {t('modules.title', 'Modules')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ width: '100%', borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>{t('modules.name', 'Name')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('modules.icon', 'Icon')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">{t('modules.actions', 'Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.map((module: Module) => (
                <TableRow key={module.id}>
                  <TableCell>{module.name}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Icon icon={module.icon_name} width={24} height={24} />
                      <Typography variant="body2" color="text.secondary">
                        {module.icon_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditIcon(module)}
                      sx={{ color: 'primary.main' }}
                    >
                      <Icon icon="solar:pen-2-linear" width={20} height={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {modules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    {t('modules.noModules', 'No modules found')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!selectedModule} onClose={handleCloseDialog}>
        <DialogTitle>{t('modules.editIcon', 'Edit Module Icon')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('modules.iconName', 'Icon Name')}
            fullWidth
            value={iconName}
            onChange={(e) => setIconName(e.target.value)}
            helperText={t('modules.iconNameHelp', 'Enter the icon name from Iconify')}
          />
          {iconName && (
            <Box display="flex" alignItems="center" gap={1} mt={2}>
              <Icon icon={iconName} width={24} height={24} />
              <Typography variant="body2" color="text.secondary">
                {iconName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSaveIcon} variant="contained" disabled={!iconName}>
            {t('common.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Modules; 