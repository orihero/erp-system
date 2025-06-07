import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  TableFooter,
  TablePagination,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Drawer,
} from '@mui/material';
import { RootState } from '@/store';
import { 
  fetchDirectoriesStart,
  deleteDirectoryStart,
  editDirectoryStart,
} from '@/store/slices/directoriesSlice';
import { Directory, DirectoryField } from '@/api/services/directories';
import DirectoryFieldsEditor from './DirectoryFieldsEditor';

const DirectoriesTable: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { directories, loading } = useSelector((state: RootState) => state.directories);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [directoryToDelete, setDirectoryToDelete] = useState<string | null>(null);

  // Edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState<Directory | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    icon_name: '',
  });
  const [editFields, setEditFields] = useState<DirectoryField[]>([]);

  useEffect(() => {
    dispatch(fetchDirectoriesStart());
  }, [dispatch]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (id: string) => {
    setDirectoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (directoryToDelete) {
      dispatch(deleteDirectoryStart(directoryToDelete));
      setDeleteDialogOpen(false);
      setDirectoryToDelete(null);
    }
  };

  const handleEditClick = (directory: Directory) => {
    setSelectedDirectory(directory);
    setEditForm({
      name: directory.name,
      icon_name: directory.icon_name,
    });
    setEditFields(directory.fields || []);
    setEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSave = () => {
    if (selectedDirectory) {
      dispatch(editDirectoryStart({
        id: selectedDirectory.id,
        data: {
          ...editForm,
          fields: editFields,
        },
      }));
      setEditModalOpen(false);
      setSelectedDirectory(null);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setSelectedDirectory(null);
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
        width: '100%'
      }}>
        <Table sx={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('directories.name')}</TableCell>
              <TableCell>{t('directories.iconName')}</TableCell>
              <TableCell>{t('directories.createdAt')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : directories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t('directories.noDirectories')}
                </TableCell>
              </TableRow>
            ) : (
              directories
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((directory: Directory) => (
                  <TableRow key={directory.id}>
                    <TableCell>{directory.name}</TableCell>
                    <TableCell>{directory.icon_name}</TableCell>
                    <TableCell>{new Date(directory.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleEditClick(directory)}
                        size="small"
                        sx={{ color: '#3b82f6' }}
                      >
                        <Icon icon="ph:pencil" width={20} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(directory.id)}
                        size="small"
                        sx={{ color: '#ef4444' }}
                      >
                        <Icon icon="ph:trash" width={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={directories.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('directories.deleteConfirm')}</DialogTitle>
        <DialogContent>
          <Typography>{t('directories.deleteWarning')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Directory Drawer */}
      <Drawer
        anchor="right"
        open={editModalOpen}
        onClose={handleEditCancel}
        PaperProps={{
          sx: {
            width: '50vw',
            maxWidth: '100vw',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
          },
        }}
      >
        <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>{t('directories.editDirectory')}</Typography>
            <IconButton onClick={handleEditCancel}>
              <Icon icon="ph:x" width={28} />
            </IconButton>
          </Box>
          <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
            <TextField label={t('directories.name')} name="name" value={editForm.name} onChange={handleEditChange} fullWidth required />
            <TextField label={t('directories.iconName')} name="icon_name" value={editForm.icon_name} onChange={handleEditChange} fullWidth required />
            
            <DirectoryFieldsEditor
              fields={editFields}
              onFieldsChange={setEditFields}
            />

            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={handleEditCancel} variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="contained" sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>
                {t('common.saveChanges')}
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
    </>
  );
};

export default DirectoriesTable; 