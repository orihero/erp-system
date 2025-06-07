import React, { useEffect, useCallback, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, IconButton, CircularProgress, TableFooter, TablePagination, Box, Button, InputBase, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, MenuItem, Drawer, Select, Chip, OutlinedInput } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchUsersStart, deleteUserStart, editUserStart, User } from '../../../store/slices/usersSlice';
import type { SelectChangeEvent } from '@mui/material/Select';

interface ClientsTableProps {
  setDrawerOpen: (open: boolean) => void;
}

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

const ClientsTable: React.FC<ClientsTableProps> = ({ setDrawerOpen }) => {
  const dispatch = useAppDispatch();
  const { users, loading, error, page, limit, search, pagination } = useAppSelector((state) => state.users);
  const [searchInput, setSearchInput] = useState(search);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    dispatch(fetchUsersStart({ page, limit, search }));
  }, [dispatch, page, limit, search]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        dispatch(fetchUsersStart({ page: 1, limit, search: searchInput }));
      }
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line
  }, [searchInput]);

  const handlePageChange = useCallback((_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    dispatch(fetchUsersStart({ page: newPage + 1, limit, search }));
  }, [dispatch, limit, search]);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(fetchUsersStart({ page: 1, limit: parseInt(event.target.value, 10), search }));
  }, [dispatch, search]);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (userToDelete) {
      dispatch(deleteUserStart(userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setEditForm({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      roles: user.roles || (user.role ? [user.role] : []),
      status: user.status,
    });
    setEditModalOpen(true);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name!]: name === 'roles' ? (typeof value === 'string' ? value.split(',') : value) : value
    }));
  };
  const handleEditSave = () => {
    if (userToEdit) {
      dispatch(editUserStart({ id: userToEdit.id, data: editForm }));
      setEditModalOpen(false);
      setUserToEdit(null);
    }
  };
  const handleEditCancel = () => {
    setEditModalOpen(false);
    setUserToEdit(null);
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

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}><CircularProgress /></div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', color: '#e53e3e', fontSize: 20, minHeight: 300 }}>{error}</div>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
        <Paper component="form" sx={{ display: 'flex', alignItems: 'center', borderRadius: 999, boxShadow: 'none', bgcolor: '#fff', py: 0.5, minWidth: 200, pl: 2, pr: .5 }}>
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: 16 }}
            placeholder="Search clients..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            endAdornment={<IconButton size="medium" sx={{ color: '#222', bgcolor: 'transparent' }}><Icon icon="ep:search" width={24} height={24} /></IconButton>}
          />
        </Paper>
        <Button
          variant="contained"
          startIcon={<Icon icon="ph:user-plus-bold" width={22} height={22} />}
          sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 500, fontSize: 16, bgcolor: '#3b82f6', color: '#fff', pl: 3, height: 48, '&:hover': { bgcolor: '#2563eb' }, pr: 3 }}
          onClick={() => setDrawerOpen(true)}
        >
          Add client
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Company</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) && users.length > 0 ? users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Avatar sx={{ bgcolor: '#3b82f6' }}>
                    {(user.firstname?.[0] || user.lastname?.[0] || user.email[0] || '?').toUpperCase()}
                  </Avatar>
                </TableCell>
                <TableCell style={{ fontWeight: 500 }}>{user.firstname || ''}</TableCell>
                <TableCell style={{ fontWeight: 500 }}>{user.lastname || ''}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {Array.isArray(user.roles) && user.roles.length > 0
                    ? user.roles.map(role => (
                        <span
                          key={role}
                          style={{
                            display: 'inline-block',
                            background: '#e0e7ff',
                            color: '#3730a3',
                            borderRadius: 8,
                            padding: '2px 8px',
                            marginRight: 4,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {role}
                        </span>
                      ))
                    : user.role || ''}
                </TableCell>
                <TableCell>
                  <span style={{ color: user.status === 'active' ? '#22c55e' : '#888', fontWeight: 600 }}>{user.status}</span>
                </TableCell>
                <TableCell>{user.company?.name || ''}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEditClick(user)}>
                    <Icon icon="ph:pencil-simple" width={20} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(user)}>
                    <Icon icon="ph:trash" width={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} align="center" style={{ color: '#888', fontSize: 20, minHeight: 300 }}>
                  No clients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={pagination?.total || 0}
              page={page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={limit}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
            />
          </TableRow>
        </TableFooter>
      </TableContainer>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
          <Typography sx={{ fontWeight: 600, mt: 1 }}>{userToDelete?.firstname} {userToDelete?.lastname} ({userToDelete?.email})</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Edit User Drawer */}
      <Drawer
        anchor="right"
        open={editModalOpen}
        onClose={handleEditCancel}
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
            <Typography variant="h5" fontWeight={700}>Edit Client</Typography>
            <IconButton onClick={handleEditCancel}>
              <Icon icon="ph:x" width={28} />
            </IconButton>
          </Box>
          <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
            <TextField label="First Name" name="firstname" value={editForm.firstname || ''} onChange={handleEditChange} fullWidth required />
            <TextField label="Last Name" name="lastname" value={editForm.lastname || ''} onChange={handleEditChange} fullWidth required />
            <TextField label="Email" name="email" value={editForm.email || ''} onChange={handleEditChange} fullWidth required type="email" />
            <Select
              multiple
              name="roles"
              value={editForm.roles || []}
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
              value={userToEdit?.company?.name || ''}
              fullWidth
              disabled
            />
            <TextField select label="Status" name="status" value={editForm.status || ''} onChange={handleEditChange} fullWidth required>
              {statusOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={handleEditCancel} variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>Save Changes</Button>
            </Box>
          </form>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ClientsTable; 