import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TableFooter, TablePagination } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCompaniesStart, deleteCompanyStart, setCompaniesPage, setCompaniesLimit } from '@/store/slices/companiesSlice';
import EditCompanyDrawer from './EditCompanyDrawer';
import type { Company } from '@/api/services/companies';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CompaniesTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { companies, loading, error, page, limit, pagination } = useAppSelector(state => state.companies);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCompaniesStart({ page, limit }));
  }, [dispatch, page, limit]);

  const handleDeleteClick = (id: string) => {
    setCompanyToDelete(id);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (companyToDelete) {
      dispatch(deleteCompanyStart(companyToDelete));
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCompanyToDelete(null);
  };
  const handleEditClick = (company: Company) => {
    setEditCompany(company);
    setEditDrawerOpen(true);
  };
  const handleEditDrawerClose = () => {
    setEditDrawerOpen(false);
    setEditCompany(null);
  };
  const handlePageChange = (_: unknown, newPage: number) => {
    dispatch(setCompaniesPage(newPage + 1));
  };
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCompaniesLimit(parseInt(event.target.value, 10)));
    dispatch(setCompaniesPage(1));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}><CircularProgress /></div>;
  if (error) return <div style={{ textAlign: 'center', color: '#e53e3e', fontSize: 20, minHeight: 300 }}>{error}</div>;

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('companies.name', 'Name')}</TableCell>
              <TableCell>{t('companies.email', 'Email')}</TableCell>
              <TableCell>{t('companies.employeeCount', 'Employee Count')}</TableCell>
              <TableCell>{t('companies.status', 'Status')}</TableCell>
              <TableCell align="right">{t('companies.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map(company => (
              <TableRow key={company.id} hover style={{ cursor: 'pointer' }} onClick={e => {
                // Prevent row click if clicking on an action button
                if ((e.target as HTMLElement).closest('button')) return;
                navigate(`/companies/${company.id}/about`);
              }}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>{company.employee_count}</TableCell>
                <TableCell>{company.status}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={ev => { ev.stopPropagation(); handleEditClick(company); }}>
                    <Icon icon="ph:pencil-simple" width={20} />
                  </IconButton>
                  <IconButton size="small" onClick={ev => { ev.stopPropagation(); handleDeleteClick(company.id); }}>
                    <Icon icon="ph:trash" width={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
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
        </Table>
      </TableContainer>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{t('companies.deleteCompany', 'Delete Company')}</DialogTitle>
        <DialogContent>{t('companies.deleteConfirm', 'Are you sure you want to delete this company?')}</DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t('common.cancel', 'Cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">{t('common.delete', 'Delete')}</Button>
        </DialogActions>
      </Dialog>
      <EditCompanyDrawer open={editDrawerOpen} onClose={handleEditDrawerClose} company={editCompany} />
    </>
  );
};

export default CompaniesTable; 