import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItemButton, ListItemText, CircularProgress, Button, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField } from '@mui/material';
import { Icon } from '@iconify/react';
import RoleManagementDrawer from './RoleManagementDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchRolesStart } from '@/store/slices/rolesSlice';
import { fetchRolePermissionsStart } from '@/store/slices/permissionsSlice';
import { modulesApi } from '@/api/services/modules';
import { directoriesService } from '@/api/services/directories.service';
import type { Module } from '@/api/services/types';
import type { Directory } from '@/api/services/directories';

const UserRoles: React.FC = () => {
  const dispatch = useDispatch();
  const { roles, loading } = useSelector((state: RootState) => state.roles);
  const permissions = useSelector((state: RootState) => state.permissions.permissions);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [modules, setModules] = useState<Module[]>([]);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');

  useEffect(() => {
    dispatch(fetchRolesStart());
    modulesApi.getAll().then(res => setModules(res.data));
    directoriesService.getAll().then(res => setDirectories(res.data));
  }, [dispatch]);

  const handleRoleClick = (roleId: string) => {
    setSelectedRoleId(roleId);
    dispatch(fetchRolePermissionsStart(roleId));
    setDrawerOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRoleId(null);
    setDrawerOpen(true);
  };

  const getModuleName = (module_id?: string) => module_id ? (modules.find(m => m.id === module_id)?.name || '') : '';
  const getDirectoryName = (directory_id?: string) => directory_id ? (directories.find(d => d.id === directory_id)?.name || '') : '';

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        User Roles
      </Typography>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary" sx={{ mb: 3 }}>
          <Tab label="Roles" />
          <Tab label="Permissions" />
        </Tabs>
        {tab === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">List of Roles</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Icon icon="ph:plus" />}
                onClick={handleCreateRole}
                sx={{ borderRadius: 999, textTransform: 'none' }}
              >
                Create Role
              </Button>
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                placeholder="Search roles..."
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                size="small"
                fullWidth
              />
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : (
              <List>
                {roles.filter(role =>
                  role.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
                  (role.description && role.description.toLowerCase().includes(roleSearch.toLowerCase()))
                ).map(role => (
                  <ListItemButton key={role.id} onClick={() => handleRoleClick(role.id)}>
                    <ListItemText primary={role.name} secondary={role.description} />
                    <Icon icon="solar:arrow-right-linear" />
                  </ListItemButton>
                ))}
              </List>
            )}
          </>
        )}
        {tab === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Permissions</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Icon icon="ph:plus" />}
                onClick={() => setDrawerOpen(true)}
                sx={{ borderRadius: 999, textTransform: 'none' }}
              >
                Add Permission
              </Button>
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                placeholder="Search permissions..."
                value={permissionSearch}
                onChange={e => setPermissionSearch(e.target.value)}
                size="small"
                fullWidth
              />
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Directory</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.filter(perm =>
                  perm.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                  (perm.description && perm.description.toLowerCase().includes(permissionSearch.toLowerCase())) ||
                  (perm.type && perm.type.toLowerCase().includes(permissionSearch.toLowerCase()))
                ).map(perm => (
                  <TableRow key={perm.id} hover>
                    <TableCell>{perm.name}</TableCell>
                    <TableCell>{perm.description}</TableCell>
                    <TableCell>{perm.type}</TableCell>
                    <TableCell>{getModuleName(perm.module_id)}</TableCell>
                    <TableCell>{getDirectoryName(perm.directory_id)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => {/* open edit permission drawer */}}><Icon icon="ph:pencil" /></IconButton>
                      <IconButton onClick={() => {/* open delete permission dialog */}}><Icon icon="ph:trash" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Paper>
      <RoleManagementDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        roleId={tab === 0 ? selectedRoleId : undefined} 
      />
    </Box>
  );
};

export default UserRoles;
export { UserRoles }; 