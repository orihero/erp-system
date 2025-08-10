import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, IconButton, TextField, Button, Select, MenuItem, Chip, OutlinedInput } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Icon } from '@iconify/react';
import { rolesApi, UserRole } from '@/api/services/roles';
import { useTranslation } from 'react-i18next';

interface AddClientDrawerProps {
  open: boolean;
  onClose: () => void;
}

const AddClientDrawer: React.FC<AddClientDrawerProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const statusOptions = [
    { value: 'active', label: t('clients.statusActive', 'Active') },
    { value: 'inactive', label: t('clients.statusInactive', 'Inactive') },
  ];
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    roles: [] as string[],
    status: 'active',
    company: '', // Set this to the current company if needed
  });
  const [roleOptions, setRoleOptions] = useState<UserRole[]>([]);

  useEffect(() => {
    rolesApi.getAll().then(res => setRoleOptions(res.data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRolesChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setForm(prev => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleRoleDelete = (roleToDelete: string) => {
    setForm(prev => ({
      ...prev,
      roles: (prev.roles || []).filter(role => role !== roleToDelete)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Dispatch add user action here
    onClose();
  };

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
          <Typography variant="h5" fontWeight={700}>{t('clients.addClient', 'Add Client')}</Typography>
          <IconButton onClick={onClose}>
            <Icon icon="ph:x" width={28} />
          </IconButton>
        </Box>
        <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={handleSubmit}>
          <TextField label={t('clients.firstName', 'First Name')} name="firstname" value={form.firstname} onChange={handleChange} fullWidth required />
          <TextField label={t('clients.lastName', 'Last Name')} name="lastname" value={form.lastname} onChange={handleChange} fullWidth required />
          <TextField label={t('clients.email', 'Email')} name="email" value={form.email} onChange={handleChange} fullWidth required type="email" />
          <Select
            multiple
            name="roles"
            value={form.roles}
            onChange={handleRolesChange}
            input={<OutlinedInput label={t('clients.roles', 'Roles')} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip
                    key={value}
                    label={roleOptions.find(r => r.name === value)?.description || value}
                    onDelete={() => handleRoleDelete(value)}
                  />
                ))}
              </Box>
            )}
            fullWidth
            required
          >
            {roleOptions.map(role => (
              <MenuItem key={role.id} value={role.name}>
                {role.description || role.name}
              </MenuItem>
            ))}
          </Select>
          <TextField label={t('clients.company', 'Company')} value={form.company} fullWidth disabled />
          <TextField select label={t('clients.status', 'Status')} name="status" value={form.status} onChange={handleChange} fullWidth required>
            {statusOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>{t('clients.addClient', 'Add Client')}</Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default AddClientDrawer; 