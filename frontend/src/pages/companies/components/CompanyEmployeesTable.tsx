import React, { useEffect } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, IconButton, Box, TextField, TableFooter, TablePagination, CircularProgress } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchCompanyEmployeesStart,
  setCompanyEmployeesSearch,
  setCompanyEmployeesPage,
  setCompanyEmployeesLimit
} from '../../../store/slices/companiesSlice';
import { useTranslation } from 'react-i18next';

interface CompanyEmployeesTableProps {
  companyId: string;
}

const CompanyEmployeesTable: React.FC<CompanyEmployeesTableProps> = ({ companyId }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const employees = useAppSelector(state => state.companies.companyEmployees);
  const loading = useAppSelector(state => state.companies.companyEmployeesLoading);
  const error = useAppSelector(state => state.companies.companyEmployeesError);
  const search = useAppSelector(state => state.companies.companyEmployeesSearch);
  const page = useAppSelector(state => state.companies.companyEmployeesPage);
  const limit = useAppSelector(state => state.companies.companyEmployeesLimit);
  const pagination = useAppSelector(state => state.companies.companyEmployeesPagination);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchCompanyEmployeesStart({ companyId, page, limit, search }));
    }
  }, [dispatch, companyId, page, limit, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCompanyEmployeesSearch(e.target.value));
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    dispatch(setCompanyEmployeesPage(newPage + 1));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCompanyEmployeesLimit(parseInt(event.target.value, 10)));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          size="small"
          placeholder={t('companies.searchEmployees', 'Search employees...')}
          value={search}
          onChange={handleSearchChange}
          sx={{ width: 320 }}
        />
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>{t('companies.firstName', 'First Name')}</TableCell>
              <TableCell>{t('companies.lastName', 'Last Name')}</TableCell>
              <TableCell>{t('companies.email', 'Email')}</TableCell>
              <TableCell>{t('companies.role', 'Role')}</TableCell>
              <TableCell>{t('companies.status', 'Status')}</TableCell>
              <TableCell align="right">{t('companies.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ minHeight: 300 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ color: '#e53e3e', fontSize: 20, minHeight: 300 }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : Array.isArray(employees) && employees.length > 0 ? employees.map((emp) => (
              <TableRow key={emp.id} hover>
                <TableCell>
                  <Avatar sx={{ bgcolor: '#3b82f6' }}>
                    {(emp.firstname?.[0] || emp.lastname?.[0] || emp.email[0] || '?').toUpperCase()}
                  </Avatar>
                </TableCell>
                <TableCell style={{ fontWeight: 500 }}>{emp.firstname || ''}</TableCell>
                <TableCell style={{ fontWeight: 500 }}>{emp.lastname || ''}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>
                  {emp.roles && emp.roles.length > 0 ? (
                    emp.roles.map(role => role.name).join(', ')
                  ) : (
                    <span style={{ color: '#888' }}>-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span style={{ color: emp.status && emp.status === 'active' ? '#22c55e' : '#888', fontWeight: 600 }}>{emp.status || '-'}</span>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small">
                    <Icon icon="ph:pencil-simple" width={20} />
                  </IconButton>
                  <IconButton size="small">
                    <Icon icon="ph:trash" width={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ color: '#888', fontSize: 20, minHeight: 300 }}>
                  {t('companies.noEmployees', 'No employees found.')}
                </TableCell>
              </TableRow>
            )}
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
      {/* TODO: EmployeeEditDrawer will be added here */}
    </Box>
  );
};

export default CompanyEmployeesTable; 