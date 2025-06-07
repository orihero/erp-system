import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface CompanyEmployeesDrawerProps {
  open: boolean;
  onClose: () => void;
  companyId: string | null;
}

interface Employee {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

const CompanyEmployeesDrawer: React.FC<CompanyEmployeesDrawerProps> = ({ open, onClose, companyId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && companyId) {
      setLoading(true);
      setError(null);
      axios.get(`/api/admin/companies/${companyId}/employees`)
        .then(res => setEmployees(res.data))
        .catch(() => setError(t('companies.employeesFetchError')))
        .finally(() => setLoading(false));
    }
  }, [open, companyId, t]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          maxWidth: '100vw',
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
        },
      }}
    >
      <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>{t('companies.employees')}</Typography>
          <IconButton onClick={onClose}>
            <Icon icon="ph:x" width={28} />
          </IconButton>
        </Box>
        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : employees.length === 0 ? (
          <Typography>{t('companies.noEmployees')}</Typography>
        ) : (
          <List>
            {employees.map(emp => (
              <ListItem key={emp.id}>
                <ListItemText
                  primary={`${emp.firstname} ${emp.lastname}`}
                  secondary={emp.email}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default CompanyEmployeesDrawer; 