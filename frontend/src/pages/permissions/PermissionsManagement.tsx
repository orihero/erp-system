import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Tabs, Tab, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Tooltip
} from '@mui/material';
import { Icon } from '@iconify/react';
import { permissionsApi, Permission } from '@/api/services/permissions';
import { rolesApi, UserRole } from '@/api/services/roles';
import PermissionDrawer from '@/components/PermissionDrawer';
import { directoriesService } from '@/api/services/directories.service';
import { useTranslation } from 'react-i18next';
import { modulesApi } from '@/api/services/modules';
import type { Module } from '@/api/services/modules';
import type { Directory } from '@/api/services/directories';

const PermissionsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Permission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [permissionDrawerOpen, setPermissionDrawerOpen] = useState(false);
  const [permissionDrawerMode, setPermissionDrawerMode] = useState<'add' | 'edit'>('add');
  const [editingPermission, setEditingPermission] = useState<Permission | undefined>(undefined);
  const [modules, setModules] = useState<Module[]>([]);
  const [directories, setDirectories] = useState<Directory[]>([]);

  const fetchPermissions = useCallback(async () => {
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
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await rolesApi.getAll();
      setRoles(res.data);
      if (res.data.length > 0 && !selectedRoleId) {
        setSelectedRoleId(res.data[0].id);
      }
    } catch (e) {
      setRoleError(getErrorMessage(e));
    }
  }, [selectedRoleId]);

  useEffect(() => {
    if (tab === 0) fetchPermissions();
    if (tab === 1) fetchRoles();
  }, [tab, fetchPermissions, fetchRoles]);

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

  useEffect(() => {
    modulesApi.getAll().then(res => setModules(res.data));
    directoriesService.getAll().then(res => setDirectories(res.data));
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    console.log('newValue', newValue);
    setTab(newValue);
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
        {t('permissions.management', 'Permissions Management')}
      </Typography>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab}  onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label={t('permissions.permissionsTab', 'Permissions')} />
          <Tab label={t('permissions.rolePermissionsTab', 'Role Permissions')} />
        </Tabs>
      </Paper>
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('permissions.permissionsTab', 'Permissions')}</Typography>
            <Button variant="contained" onClick={openAddPermissionDrawer} sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>
              <Icon icon="ph:plus" style={{ marginRight: 8 }} /> {t('permissions.addPermission', 'Add Permission')}
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
                  <TableCell>{t('permissions.name', 'Name')}</TableCell>
                  <TableCell>{t('permissions.description', 'Description')}</TableCell>
                  <TableCell>{t('permissions.type', 'Type')}</TableCell>
                  <TableCell align="right">{t('common.actions', 'Actions')}</TableCell>
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
                        <IconButton onClick={() => openEditPermissionDrawer(perm)}>
                          <Icon icon="ph:pencil" />
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
          <PermissionDrawer
            open={permissionDrawerOpen}
            onClose={() => setPermissionDrawerOpen(false)}
            onSubmit={async data => {
              if (permissionDrawerMode === 'edit' && editingPermission) {
                await permissionsApi.update(editingPermission.id, data);
              } else {
                await permissionsApi.create(data);
              }
              setPermissionDrawerOpen(false);
              fetchPermissions();
            }}
            initialData={permissionDrawerMode === 'edit' ? editingPermission : undefined}
            modules={modules}
            directories={directories}
            mode={permissionDrawerMode}
          />
          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
            <DialogTitle>{t('permissions.deletePermission', 'Delete Permission')}</DialogTitle>
            <DialogContent>
              <Typography>{t('permissions.deleteConfirm', { name: selected?.name })}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDelete}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handleDelete} color="error" variant="contained">{t('common.delete', 'Delete')}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('permissions.rolePermissionsTab', 'Role Permissions')}</Typography>
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
                  <TableCell>{t('permissions.permission', 'Permission')}</TableCell>
                  <TableCell>{t('permissions.description', 'Description')}</TableCell>
                  <TableCell>{t('permissions.type', 'Type')}</TableCell>
                  <TableCell align="right">{t('permissions.assigned', 'Assigned')}</TableCell>
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
                            {t('permissions.remove', 'Remove')}
                          </Button>
                        ) : (
                          <Button color="primary" variant="outlined" size="small" onClick={() => handleAssignPermission(perm.id)}>
                            {t('permissions.assign', 'Assign')}
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