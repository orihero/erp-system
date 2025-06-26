import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  TextField,
  Typography,
  List,
  ListItem,
  CircularProgress
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  fetchRolesStart,
  createRoleStart
} from '@/store/slices/rolesSlice';
import {
  fetchPermissionsStart,
  createPermissionStart,
  updatePermissionStart,
  fetchRolePermissionsStart,
  assignPermissionToRoleStart,
  removePermissionFromRoleStart,
} from '@/store/slices/permissionsSlice';
import type { Permission as BasePermission } from '@/api/services/permissions';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import { modulesApi } from '@/api/services/modules';
import { directoriesService } from '@/api/services/directories.service';
import type { Module } from '@/api/services/types';
import type { Directory } from '@/api/services/directories';
import PermissionDrawer from '@/components/PermissionDrawer';

interface RoleManagementDrawerProps {
  open: boolean;
  onClose: () => void;
  roleId?: string | null;
}

type Permission = BasePermission & {
  effective_from?: string;
  effective_until?: string;
};

const RoleManagementDrawer: React.FC<RoleManagementDrawerProps> = ({ open, onClose, roleId }) => {
  const dispatch = useDispatch();
  const { roles, loading, error } = useSelector((state: RootState) => state.roles);
  const { permissions, rolePermissions: existingRolePermissions, loading: permissionsLoading } = useSelector((state: RootState) => state.permissions);
  const [form, setForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [permissionDrawerOpen, setPermissionDrawerOpen] = useState(false);
  const [permissionDrawerMode, setPermissionDrawerMode] = useState<'add' | 'edit'>('add');
  const [editingPermission, setEditingPermission] = useState<Permission | undefined>(undefined);
  const [modules, setModules] = useState<Module[]>([]);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [autocompleteValue, setAutocompleteValue] = useState<Permission | undefined>(undefined);

  useEffect(() => {
    if (open) {
      dispatch(fetchRolesStart());
      dispatch(fetchPermissionsStart());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (roleId) {
      dispatch(fetchRolePermissionsStart(roleId));
    }
  }, [roleId, dispatch]);

  useEffect(() => {
    if (permissionDrawerOpen) {
      modulesApi.getAll().then(res => setModules(res.data));
      directoriesService.getAll().then(res => setDirectories(res.data));
    }
  }, [permissionDrawerOpen]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createRoleStart(form));
    setForm({ name: '', description: '' });
    onClose();
  };

  const handleAssignPermission = (permissionId: string) => {
    if (roleId) {
      dispatch(assignPermissionToRoleStart({ roleId, data: { permission_id: permissionId } }));
    }
  };
  const handleRemovePermission = (permissionId: string) => {
    if (roleId) {
      dispatch(removePermissionFromRoleStart({ roleId, permissionId }));
    }
  };
  const isPermissionAssigned = (permissionId: string) => {
    return existingRolePermissions.some(rp => rp.permission_id === permissionId);
  };

  const openAddPermissionDrawer = () => {
    setEditingPermission(undefined);
    setPermissionDrawerMode('add');
    setPermissionDrawerOpen(true);
  };
  const openEditPermissionDrawer = (perm: Permission) => {
    setEditingPermission(perm);
    setPermissionDrawerMode('edit');
    setPermissionDrawerOpen(true);
  };

  // Helper to get module and directory names
  const getModuleName = (module_id: string) => modules.find(m => m.id === module_id)?.name || '';
  const getDirectoryName = (directory_id: string) => directories.find(d => d.id === directory_id)?.name || '';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '40vw',
          maxWidth: 480,
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
        },
      }}
    >
      <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Role Management</Typography>
          <IconButton onClick={onClose}>
            <Icon icon="ph:x" width={28} />
          </IconButton>
        </Box>
        {/* If a role is selected, show only that role's details */}
        {roleId ? (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              (() => {
                const role = roles.find(r => r.id === roleId);
                if (!role) return <Typography color="text.secondary">Role not found.</Typography>;
                return (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>{role.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{role.description}</Typography>
                  </Box>
                );
              })()
            )}
            {/* Permissions assignment with searchable dropdown */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Assign Permissions</Typography>
              <Autocomplete
                value={autocompleteValue}
                onChange={(_, newValue) => {
                  if (!newValue) return;
                  if ((newValue as any).id === 'create') {
                    openAddPermissionDrawer();
                    setAutocompleteValue(undefined);
                  } else {
                    handleAssignPermission((newValue as Permission).id);
                    setAutocompleteValue(undefined);
                  }
                }}
                options={permissions.filter(perm => !isPermissionAssigned(perm.id))}
                getOptionLabel={option => (option as Permission).name}
                filterOptions={(options, { inputValue }) =>
                  [
                    ...options.filter(opt =>
                      ((opt as Permission).name.toLowerCase().includes(inputValue.toLowerCase()) ||
                      ((opt as Permission).description && (opt as Permission).description!.toLowerCase().includes(inputValue.toLowerCase())))
                    ).slice(0, 5),
                    { id: 'create', name: 'Create new permission' }
                  ]
                }
                renderInput={params => (
                  <TextField {...params} label="Search permissions..." variant="outlined" size="small" />
                )}
                renderOption={(props, option) => {
                  const opt = option as Permission | { id: string; name: string };
                  if (opt.id === 'create') {
                    return (
                      <li {...props} key="create-permission" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 500 }}>
                        <Icon icon="ph:plus" style={{ marginRight: 8 }} /> Create new permission
                      </li>
                    );
                  }
                  const perm = opt as Permission;
                  return (
                    <li {...props} key={perm.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: 8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>{perm.name}</Typography>
                        {perm.type && <Typography variant="caption" sx={{ bgcolor: '#e0e7ef', px: 1, borderRadius: 1, ml: 1 }}>{perm.type}</Typography>}
                      </Box>
                      {perm.description && <Typography variant="caption" color="text.secondary">{perm.description}</Typography>}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                        {perm.module_id && <Typography variant="caption" color="text.secondary">Module: {getModuleName(perm.module_id)}</Typography>}
                        {perm.directory_id && <Typography variant="caption" color="text.secondary">Directory: {getDirectoryName(perm.directory_id)}</Typography>}
                        {perm.effective_from && <Typography variant="caption" color="text.secondary">From: {perm.effective_from}</Typography>}
                        {perm.effective_until && <Typography variant="caption" color="text.secondary">Until: {perm.effective_until}</Typography>}
                      </Box>
                    </li>
                  );
                }}
                disableClearable
                clearOnBlur
                blurOnSelect
                openOnFocus
              />
              {/* List of currently assigned permissions */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Assigned Permissions</Typography>
                {permissionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress size={20} /></Box>
                ) : (
                  <List>
                    {permissions.filter(perm => isPermissionAssigned(perm.id)).map(perm => (
                      <ListItem key={perm.id} divider secondaryAction={
                        <>
                          <IconButton onClick={() => openEditPermissionDrawer(perm)}><Icon icon="ph:pencil" /></IconButton>
                          <IconButton onClick={() => handleRemovePermission(perm.id)}><Icon icon="ph:minus" /></IconButton>
                        </>
                      }>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>{perm.name}</Typography>
                            {perm.type && <Typography variant="caption" sx={{ bgcolor: '#e0e7ef', px: 1, borderRadius: 1, ml: 1 }}>{perm.type}</Typography>}
                          </Box>
                          {perm.description && <Typography variant="caption" color="text.secondary">{perm.description}</Typography>}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                            {perm.module_id && <Typography variant="caption" color="text.secondary">Module: {getModuleName(perm.module_id)}</Typography>}
                            {perm.directory_id && <Typography variant="caption" color="text.secondary">Directory: {getDirectoryName(perm.directory_id)}</Typography>}
                            {perm.effective_from && <Typography variant="caption" color="text.secondary">From: {perm.effective_from}</Typography>}
                            {perm.effective_until && <Typography variant="caption" color="text.secondary">Until: {perm.effective_until}</Typography>}
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
            {/* Permission Add/Edit Drawer */}
            <PermissionDrawer
              open={permissionDrawerOpen}
              onClose={() => setPermissionDrawerOpen(false)}
              onSubmit={data => {
                if (permissionDrawerMode === 'edit' && editingPermission) {
                  dispatch(updatePermissionStart({ id: editingPermission.id, data }));
                } else {
                  dispatch(createPermissionStart(data));
                }
                setPermissionDrawerOpen(false);
                dispatch(fetchPermissionsStart());
              }}
              initialData={permissionDrawerMode === 'edit' ? editingPermission : undefined}
              modules={modules}
              directories={directories}
              mode={permissionDrawerMode}
            />
          </>
        ) : (
          // Render the create role form directly in the drawer
          <Box component="form" onSubmit={handleAddRole} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Create New Role</Typography>
            <TextField label="Role Name" name="name" value={form.name} onChange={handleFormChange} required fullWidth />
            <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained">Add</Button>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default RoleManagementDrawer; 