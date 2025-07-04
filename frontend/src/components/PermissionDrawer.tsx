import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, TextField, MenuItem, Button } from '@mui/material';
import type { Module } from '@/api/services/types';
import type { Directory } from '@/api/services/directories';
import type { Permission } from '@/api/services/permissions';

interface PermissionForm {
  name: string;
  description: string;
  type: 'read' | 'write' | 'manage';
  module_id: string;
  directory_id: string;
  effective_from: string;
  effective_until: string;
  constraint_data: string;
}

interface PermissionDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PermissionForm) => void;
  initialData?: Permission;
  modules: Module[];
  directories: Directory[];
  mode: 'add' | 'edit';
}

const typeOptions = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'manage', label: 'Manage (read+write)' },
];

const PermissionDrawer: React.FC<PermissionDrawerProps> = ({ open, onClose, onSubmit, initialData, modules, directories, mode }) => {
  const [form, setForm] = useState<PermissionForm>({
    name: '',
    description: '',
    type: 'read',
    module_id: '',
    directory_id: '',
    effective_from: '',
    effective_until: '',
    constraint_data: '',
  });

  useEffect(() => {
    if (initialData) {
      const safeData = initialData as Partial<Permission> & { effective_from?: string; effective_until?: string; constraint_data?: unknown };
      setForm({
        name: safeData.name || '',
        description: safeData.description || '',
        type: safeData.type || 'read',
        module_id: safeData.module_id || '',
        directory_id: safeData.directory_id || '',
        effective_from: safeData.effective_from || '',
        effective_until: safeData.effective_until || '',
        constraint_data: safeData.constraint_data ? JSON.stringify(safeData.constraint_data, null, 2) : '',
      });
    } else {
      setForm({
        name: '',
        description: '',
        type: 'read',
        module_id: '',
        directory_id: '',
        effective_from: '',
        effective_until: '',
        constraint_data: '',
      });
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.constraint_data) {
      try {
        (payload as unknown as { constraint_data: unknown }).constraint_data = JSON.parse(payload.constraint_data);
      } catch {
        // ignore JSON parse error
      }
    }
    onSubmit(payload);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 400, p: 3 } }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{mode === 'edit' ? 'Edit Permission' : 'Create Permission'}</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} required fullWidth sx={{ mb: 2 }} />
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField
            select
            label="Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            fullWidth
            sx={{ mb: 2 }}
          >
            {typeOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Module"
            name="module_id"
            value={form.module_id}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="">None</MenuItem>
            {modules.map((mod) => (
              <MenuItem key={mod.id} value={mod.id}>{mod.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Directory"
            name="directory_id"
            value={form.directory_id}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="">None</MenuItem>
            {directories.map((dir) => (
              <MenuItem key={dir.id} value={dir.id}>{dir.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Effective From"
            name="effective_from"
            type="date"
            value={form.effective_from}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Effective Until"
            name="effective_until"
            type="date"
            value={form.effective_until}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Constraint Data (JSON)"
            name="constraint_data"
            value={form.constraint_data}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">{mode === 'edit' ? 'Save' : 'Create'}</Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default PermissionDrawer; 