import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, TextField, Button, Drawer, Select, Chip, OutlinedInput, MenuItem } from '@mui/material';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRolesStart } from '@/store/slices/rolesSlice';
import type { RootState } from '@/store';
import type { User } from '../../../store/slices/usersSlice';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';

interface EditUserDrawerProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<User>) => void;
}

const EditUserDrawer: React.FC<EditUserDrawerProps> = ({ open, user, onClose, onSave }) => {
  const dispatch = useDispatch();
  const { roles } = useSelector((state: RootState) => state.roles);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const { t } = useTranslation();
  const statusOptions = [
    { value: 'active', label: t('clients.statusActive', 'Active') },
    { value: 'inactive', label: t('clients.statusInactive', 'Inactive') },
  ];

  useEffect(() => {
    if (open && user) {
      dispatch(fetchRolesStart());
      setEditForm({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        roles: user.roles || (user.role ? [user.role] : []),
        status: user.status,
      });
    }
  }, [dispatch, open, user]);

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
    if (user) {
      onSave(user.id, editForm);
    }
  };

  if (!user) {
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
          <Typography variant="h6">{t('clients.noClientSelected', 'No client selected for editing.')}</Typography>
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
          <Typography variant="h5" fontWeight={700}>{t('clients.editClient', 'Edit Client')}</Typography>
          <IconButton onClick={onClose}>
            <Icon icon="ph:x" width={28} />
          </IconButton>
        </Box>
        <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
          <TextField label={t('clients.firstName', 'First Name')} name="firstname" value={editForm.firstname || ''} onChange={handleEditChange} fullWidth required />
          <TextField label={t('clients.lastName', 'Last Name')} name="lastname" value={editForm.lastname || ''} onChange={handleEditChange} fullWidth required />
          <TextField label={t('clients.email', 'Email')} name="email" value={editForm.email || ''} onChange={handleEditChange} fullWidth required type="email" />
          <Select
            multiple
            name="roles"
            value={editForm.roles || []}
            onChange={handleRolesChange}
            input={<OutlinedInput label={t('clients.roles', 'Roles')} />}
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
          <TextField label={t('clients.company', 'Company')} value={user?.company?.name || ''} fullWidth disabled />
          <TextField select label={t('clients.status', 'Status')} name="status" value={editForm.status || ''} onChange={handleEditChange} fullWidth required>
            {statusOptions.map((option: { value: string; label: string }) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>{t('clients.saveChanges', 'Save Changes')}</Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default EditUserDrawer; 