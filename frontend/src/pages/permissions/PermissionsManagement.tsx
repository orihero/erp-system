import React, { useEffect, useState } from 'react';
import {
  Box, Tabs, Tab, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Tooltip
} from '@mui/material';
import { Icon } from '@iconify/react';
import { permissionsApi, Permission } from '@/api/services/permissions';
import { rolesApi, UserRole } from '@/api/services/roles';

const PermissionsManagement: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<Permission | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; type: string }>({ name: '', description: '', type: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await permissionsApi.getAll();
      setPermissions(res.data);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await rolesApi.getAll();
      setRoles(res.data);
      if (res.data.length > 0 && !selectedRoleId) {
        setSelectedRoleId(res.data[0].id);
      }
    } catch (e) {
      setRoleError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    if (tab === 0) fetchPermissions();
    if (tab === 1) fetchRoles();
  }, [tab]);

  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!selectedRoleId) return;
      setRoleLoading(true);
      setRoleError(null);
      try {
        const res = await fetch(`/api/roles/${selectedRoleId}/permissions`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch role permissions');
        const data = await res.json();
        setRolePermissions(data.map((p: { id: string }) => p.id));
      } catch (e) {
        setRoleError(getErrorMessage(e));
      } finally {
        setRoleLoading(false);
      }
    };
    if (tab === 1 && selectedRoleId) fetchRolePermissions();
  }, [tab, selectedRoleId]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleOpenAdd = () => {
    setForm({ name: '', description: '', type: '' });
    setEditMode(false);
    setDialogOpen(true);
  };
  const handleOpenEdit = (perm: Permission) => {
    setSelected(perm);
    setForm({ name: perm.name, description: perm.description || '', type: perm.type || '' });
    setEditMode(true);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelected(null);
    setForm({ name: '', description: '', type: '' });
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && selected) {
        await permissionsApi.update(selected.id, form);
      } else {
        await permissionsApi.create(form);
      }
      handleCloseDialog();
      fetchPermissions();
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to save permission');
    }
  };
  const handleOpenDelete = (perm: Permission) => {
    setSelected(perm);
    setDeleteDialogOpen(true);
  };
  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setSelected(null);
  };
  const handleDelete = async () => {
    if (!selected) return;
    try {
      await permissionsApi.delete(selected.id);
      handleCloseDelete();
      fetchPermissions();
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to delete permission');
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedRoleId(e.target.value as string);
  };

  const handleAssignPermission = async (permissionId: string) => {
    if (!selectedRoleId) return;
    setRoleLoading(true);
    setRoleError(null);
    try {
      await permissionsApi.assignToRole(selectedRoleId, { permission_id: permissionId });
      setRolePermissions(prev => [...prev, permissionId]);
    } catch (e) {
      setRoleError(getErrorMessage(e));
    } finally {
      setRoleLoading(false);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    if (!selectedRoleId) return;
    setRoleLoading(true);
    setRoleError(null);
    try {
      await permissionsApi.removeFromRole(selectedRoleId, permissionId);
      setRolePermissions(prev => prev.filter(id => id !== permissionId));
    } catch (e) {
      setRoleError(getErrorMessage(e));
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Permissions Management
      </Typography>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Permissions" />
          <Tab label="Role Permissions" />
        </Tabs>
      </Paper>
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Permissions</Typography>
            <Button variant="contained" onClick={handleOpenAdd} sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>
              <Icon icon="ph:plus" style={{ marginRight: 8 }} /> Add Permission
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map(perm => (
                  <TableRow key={perm.id} hover>
                    <TableCell>{perm.name}</TableCell>
                    <TableCell>{perm.description}</TableCell>
                    <TableCell>{perm.type}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenEdit(perm)}>
                          <Icon icon="ph:pencil-simple" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleOpenDelete(perm)}>
                          <Icon icon="ph:trash" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {/* Add/Edit Dialog */}
          <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
            <DialogTitle>{editMode ? 'Edit Permission' : 'Add Permission'}</DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Name" name="name" value={form.name} onChange={handleFormChange} required fullWidth />
                <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth />
                <TextField label="Type" name="type" value={form.type} onChange={handleFormChange} fullWidth />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" variant="contained">{editMode ? 'Save' : 'Add'}</Button>
              </DialogActions>
            </form>
          </Dialog>
          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
            <DialogTitle>Delete Permission</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete the permission "{selected?.name}"?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDelete}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Role Permissions</Typography>
          {roleError && <Typography color="error">{roleError}</Typography>}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Select Role:</Typography>
            <select value={selectedRoleId} onChange={handleRoleChange} style={{ padding: 8, borderRadius: 8 }}>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.description || role.name}</option>
              ))}
            </select>
          </Box>
          {roleLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Permission</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Assigned</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map(perm => {
                  const assigned = rolePermissions.includes(perm.id);
                  return (
                    <TableRow key={perm.id} hover>
                      <TableCell>{perm.name}</TableCell>
                      <TableCell>{perm.description}</TableCell>
                      <TableCell>{perm.type}</TableCell>
                      <TableCell align="right">
                        {assigned ? (
                          <Button color="error" variant="outlined" size="small" onClick={() => handleRemovePermission(perm.id)}>
                            Remove
                          </Button>
                        ) : (
                          <Button color="primary" variant="outlined" size="small" onClick={() => handleAssignPermission(perm.id)}>
                            Assign
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </Box>
  );
};

function getErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const response = (e as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || 'An error occurred';
  }
  return 'An error occurred';
}

export default PermissionsManagement; 