import React, { useEffect, useCallback, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, IconButton, CircularProgress, TableFooter, TablePagination, Box, Button, InputBase, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchUsersStart, deleteUserStart, editUserStart, User } from '../../../store/slices/usersSlice';
import EditUserDrawer from './EditUserDrawer';
import { usePermissions } from '../../../hooks/usePermissions';
import { useTranslation } from 'react-i18next';

interface ClientsTableProps {
  setDrawerOpen: (open: boolean) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({ setDrawerOpen }) => {
  const dispatch = useAppDispatch();
  const { users, loading, error, page, limit, search, pagination } = useAppSelector((state) => state.users);
  const [searchInput, setSearchInput] = useState(search);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { check } = usePermissions();
  const { t } = useTranslation();

  // Check permissions
  const canEditClients = check({ requiredType: 'edit', entityType: 'user' });
  const canDeleteClients = check({ requiredType: 'delete', entityType: 'user' });

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
      dispatch(deleteUserStart());
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
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    dispatch(editUserStart());
    setEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setUserToEdit(null);
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
            placeholder={t('clients.search', 'Search clients...')}
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
          {t('clients.addClient', 'Add client')}
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>{t('clients.firstName', 'First Name')}</TableCell>
              <TableCell>{t('clients.lastName', 'Last Name')}</TableCell>
              <TableCell>{t('clients.email', 'Email')}</TableCell>
              <TableCell>{t('clients.role', 'Role')}</TableCell>
              <TableCell>{t('clients.status', 'Status')}</TableCell>
              <TableCell>{t('clients.company', 'Company')}</TableCell>
              <TableCell align="right">{t('clients.actions', 'Actions')}</TableCell>
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
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditClick(user)}
                    disabled={!canEditClients}
                    sx={{ opacity: canEditClients ? 1 : 0.5 }}
                  >
                    <Icon icon="ph:pencil-simple" width={20} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteClick(user)}
                    disabled={!canDeleteClients}
                    sx={{ opacity: canDeleteClients ? 1 : 0.5 }}
                  >
                    <Icon icon="ph:trash" width={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} align="center" style={{ color: '#888', fontSize: 20, minHeight: 300 }}>
                  {t('clients.noClients', 'No clients found.')}
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
        <DialogTitle>{t('clients.deleteUser', 'Delete User')}</DialogTitle>
        <DialogContent>
          <Typography>{t('clients.deleteConfirm', 'Are you sure you want to delete this user?')}</Typography>
          <Typography sx={{ fontWeight: 600, mt: 1 }}>{userToDelete?.firstname} {userToDelete?.lastname} ({userToDelete?.email})</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t('common.cancel', 'Cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">{t('common.delete', 'Delete')}</Button>
        </DialogActions>
      </Dialog>
      {/* Edit User Drawer */}
      <EditUserDrawer
        open={editModalOpen}
        user={userToEdit}
        onClose={handleEditCancel}
        onSave={handleEditSave}
      />
    </Box>
  );
};

export default ClientsTable; 