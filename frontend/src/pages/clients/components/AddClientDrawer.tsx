import React, { useState } from 'react';
import { Drawer, Box, Typography, IconButton, TextField, Button, Select, MenuItem, Chip, OutlinedInput } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Icon } from '@iconify/react';

const roleOptions = [
  { value: 'cashier', label: 'Cashier' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
  { value: 'store_manager', label: 'Store Manager' },
  { value: 'production_supervisor', label: 'Production Supervisor' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'quality_controller', label: 'Quality Controller' },
  { value: 'logistics_coordinator', label: 'Logistics Coordinator' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

interface AddClientDrawerProps {
  open: boolean;
  onClose: () => void;
}

const AddClientDrawer: React.FC<AddClientDrawerProps> = ({ open, onClose }) => {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    roles: [] as string[],
    status: 'active',
    company: '', // Set this to the current company if needed
  });

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
          <Typography variant="h5" fontWeight={700}>Add Client</Typography>
          <IconButton onClick={onClose}>
            <Icon icon="ph:x" width={28} />
          </IconButton>
        </Box>
        <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={handleSubmit}>
          <TextField label="First Name" name="firstname" value={form.firstname} onChange={handleChange} fullWidth required />
          <TextField label="Last Name" name="lastname" value={form.lastname} onChange={handleChange} fullWidth required />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required type="email" />
          <Select
            multiple
            name="roles"
            value={form.roles}
            onChange={handleRolesChange}
            input={<OutlinedInput label="Roles" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip
                    key={value}
                    label={roleOptions.find(r => r.value === value)?.label || value}
                    onDelete={() => handleRoleDelete(value)}
                  />
                ))}
              </Box>
            )}
            fullWidth
            required
          >
            {roleOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Company"
            value={form.company}
            fullWidth
            disabled
          />
          <TextField select label="Status" name="status" value={form.status} onChange={handleChange} fullWidth required>
            {statusOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
          </TextField>
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>Add Client</Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default AddClientDrawer; 