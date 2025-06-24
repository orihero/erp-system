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
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Tooltip
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  fetchRolesStart,
  createRoleStart,
  updateRoleStart,
  deleteRoleStart
} from '@/store/slices/rolesSlice';
import type { UserRole } from '@/api/services/roles';

interface RoleManagementDrawerProps {
  open: boolean;
  onClose: () => void;
}

const RoleManagementDrawer: React.FC<RoleManagementDrawerProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { roles, loading, error } = useSelector((state: RootState) => state.roles);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState<{ name: string; description: string }>({ name: '', description: '' });

  useEffect(() => {
    if (open) {
      dispatch(fetchRolesStart());
    }
  }, [open, dispatch]);

  const handleOpenAdd = () => {
    setForm({ name: '', description: '' });
    setAddDialogOpen(true);
  };
  const handleOpenEdit = (role: UserRole) => {
    setSelectedRole(role);
    setForm({ name: role.name, description: role.description || '' });
    setEditDialogOpen(true);
  };
  const handleOpenDelete = (role: UserRole) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };
  const handleCloseDialogs = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedRole(null);
    setForm({ name: '', description: '' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createRoleStart({ name: form.name, description: form.description }));
    handleCloseDialogs();
  };
  const handleEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      dispatch(updateRoleStart({ id: selectedRole.id, data: { name: form.name, description: form.description } }));
    }
    handleCloseDialogs();
  };
  const handleDeleteRole = () => {
    if (selectedRole) {
      dispatch(deleteRoleStart(selectedRole.id));
    }
    handleCloseDialogs();
  };

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
        <Button variant="contained" onClick={handleOpenAdd} sx={{ mb: 2, borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>
          <Icon icon="ph:plus" style={{ marginRight: 8 }} /> Add Role
        </Button>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <List>
            {roles.map(role => (
              <ListItem key={role.id} divider>
                <ListItemText
                  primary={role.name}
                  secondary={role.description}
                />
                {!('is_system' in role && role.is_system) && (
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit">
                      <IconButton edge="end" onClick={() => handleOpenEdit(role)}>
                        <Icon icon="ph:pencil-simple" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton edge="end" onClick={() => handleOpenDelete(role)}>
                        <Icon icon="ph:trash" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
        {/* Add Role Dialog */}
        <Dialog open={addDialogOpen} onClose={handleCloseDialogs} maxWidth="xs" fullWidth>
          <DialogTitle>Add Role</DialogTitle>
          <form onSubmit={handleAddRole}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Role Name" name="name" value={form.name} onChange={handleFormChange} required fullWidth />
              <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs}>Cancel</Button>
              <Button type="submit" variant="contained">Add</Button>
            </DialogActions>
          </form>
        </Dialog>
        {/* Edit Role Dialog */}
        <Dialog open={editDialogOpen} onClose={handleCloseDialogs} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Role</DialogTitle>
          <form onSubmit={handleEditRole}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Role Name" name="name" value={form.name} onChange={handleFormChange} required fullWidth />
              <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs}>Cancel</Button>
              <Button type="submit" variant="contained">Save</Button>
            </DialogActions>
          </form>
        </Dialog>
        {/* Delete Role Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDialogs} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete the role "{selectedRole?.name}"?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button onClick={handleDeleteRole} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Drawer>
  );
};

export default RoleManagementDrawer; 