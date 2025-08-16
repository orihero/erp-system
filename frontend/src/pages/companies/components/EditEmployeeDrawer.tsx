import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, TextField, Button, Drawer, Select, Chip, OutlinedInput, MenuItem } from '@mui/material';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRolesStart } from '@/store/slices/rolesSlice';
import type { RootState } from '@/store';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';

interface Employee {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  status?: string;
  roles: { id: string; name: string; description?: string }[];
}

interface EditEmployeeDrawerProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<Employee>) => void;
}

const EditEmployeeDrawer: React.FC<EditEmployeeDrawerProps> = ({ open, employee, onClose, onSave }) => {
  const dispatch = useDispatch();
  const { roles } = useSelector((state: RootState) => state.roles);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const { t } = useTranslation();
  
  const statusOptions = [
    { value: 'active', label: t('companies.statusActive', 'Active') },
    { value: 'inactive', label: t('companies.statusInactive', 'Inactive') },
  ];

  useEffect(() => {
    if (open && employee) {
      dispatch(fetchRolesStart());
      setEditForm({
        firstname: employee.firstname,
        lastname: employee.lastname,
        email: employee.email,
        roles: employee.roles?.map(role => role.id) || [],
        status: employee.status,
      });
    }
  }, [dispatch, open, employee]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name!]: name === 'roles' ? (typeof value === 'string' ? value.split(',') : value) : value
    }));
  };

  const handleRolesChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setEditForm(prev => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleRoleDelete = (roleToDelete: string) => {
    setEditForm(prev => ({
      ...prev,
      roles: (prev.roles || []).filter(role => role !== roleToDelete)
    }));
  };

  const handleEditSave = () => {
    if (employee) {
      onSave(employee.id, editForm);
    }
  };

  if (!employee) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 420,
            maxWidth: '100vw',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
          },
        }}
      >
        <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h6">{t('companies.noEmployeeSelected', 'No employee selected for editing.')}</Typography>
          <Button onClick={onClose} variant="outlined" sx={{ mt: 2, borderRadius: 999, textTransform: 'none' }}>{t('common.close', 'Close')}</Button>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          maxWidth: '100vw',
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
        },
      }}
    >
      <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>{t('companies.editEmployee', 'Edit Employee')}</Typography>
          <IconButton onClick={onClose}>
            <Icon icon="ph:x" width={28} />
          </IconButton>
        </Box>
        <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
          <TextField 
            label={t('companies.firstName', 'First Name')} 
            name="firstname" 
            value={editForm.firstname || ''} 
            onChange={handleEditChange} 
            fullWidth 
            required 
          />
          <TextField 
            label={t('companies.lastName', 'Last Name')} 
            name="lastname" 
            value={editForm.lastname || ''} 
            onChange={handleEditChange} 
            fullWidth 
            required 
          />
          <TextField 
            label={t('companies.email', 'Email')} 
            name="email" 
            value={editForm.email || ''} 
            onChange={handleEditChange} 
            fullWidth 
            required 
            type="email" 
          />
          <Select
            multiple
            name="roles"
            value={editForm.roles || []}
            onChange={handleRolesChange}
            input={<OutlinedInput label={t('companies.roles', 'Roles')} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((roleId) => {
                  const roleObj = roles.find(r => r.id === roleId || r.name === roleId);
                  return (
                    <Chip
                      key={roleId}
                      label={roleObj?.description || roleObj?.name || roleId}
                      onDelete={() => handleRoleDelete(roleId)}
                      onMouseDown={e => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    />
                  );
                })}
              </Box>
            )}
            fullWidth
            required
          >
            {roles.map(role => (
              <MenuItem key={role.id} value={role.id}>
                {role.description || role.name}
              </MenuItem>
            ))}
          </Select>
          <TextField 
            select 
            label={t('companies.status', 'Status')} 
            name="status" 
            value={editForm.status || ''} 
            onChange={handleEditChange} 
            fullWidth 
            required
          >
            {statusOptions.map((option: { value: string; label: string }) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>
              {t('companies.saveChanges', 'Save Changes')}
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default EditEmployeeDrawer;
