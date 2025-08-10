import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { editCompanyStart } from '@/store/slices/companiesSlice';
import type { Company } from '@/api/services/companies';
import CompanyEmployeesDrawer from './CompanyEmployeesDrawer';

const statusOptions = [
  { value: 'active', label: 'companies.statusOptions.active' },
  { value: 'inactive', label: 'companies.statusOptions.inactive' },
];

const employeeCountOptions = [
  { value: 'less_than_10', label: 'companies.employeeCountOptions.lessThan10' },
  { value: '10_to_50', label: 'companies.employeeCountOptions.10to50' },
  { value: '50_to_100', label: 'companies.employeeCountOptions.50to100' },
  { value: '100_to_500', label: 'companies.employeeCountOptions.100to500' },
  { value: '500_to_1000', label: 'companies.employeeCountOptions.500to1000' },
  { value: 'more_than_1000', label: 'companies.employeeCountOptions.moreThan1000' },
];

interface EditCompanyDrawerProps {
  open: boolean;
  onClose: () => void;
  company: Company & { directories?: { id: string; name: string; icon_name?: string }[] } | null;
}

interface Contact {
  name: string;
  value: string;
}

const EditCompanyDrawer: React.FC<EditCompanyDrawerProps> = ({ open, onClose, company }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    name: '',
    email: '',
    employee_count: '',
    status: 'active',
    logo: '',
    address: '',
    description: '',
    website: '',
    phone: '',
    tax_id: '',
    registration_number: '',
    industry: '',
    founded_year: '',
    contacts: {} as Record<string, string>
  });
  const [newContact, setNewContact] = useState<Contact>({ name: '', value: '' });
  const [employeesDrawerOpen, setEmployeesDrawerOpen] = useState(false);

  useEffect(() => {
    if (company && open) {
      setForm({
        name: company.name || '',
        email: company.email || company.admin_email || '',
        employee_count: String(company.employee_count || ''),
        status: company.status || 'active',
        logo: company.logo || '',
        address: company.address || '',
        description: company.description || '',
        website: company.website || '',
        phone: company.phone || '',
        tax_id: company.tax_id || '',
        registration_number: company.registration_number || '',
        industry: company.industry || '',
        founded_year: company.founded_year ? String(company.founded_year) : '',
        contacts: company.contacts || {},
      });
    }
  }, [company, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setForm({ ...form, [e.target.name as string]: e.target.value as string });
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.value) {
      setForm({
        ...form,
        contacts: {
          ...form.contacts,
          [newContact.name]: newContact.value
        }
      });
      setNewContact({ name: '', value: '' });
    }
  };

  const handleRemoveContact = (name: string) => {
    const newContacts = { ...form.contacts };
    delete newContacts[name];
    setForm({ ...form, contacts: newContacts });
  };

  // Helper function to validate URLs
  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate website if present
    if (form.website && !isValidUrl(form.website)) {
      alert(t('companies.websiteInvalid'));
      return;
    }
    if (company) {
      dispatch(editCompanyStart({
        id: company.id,
        data: {
          name: form.name,
          admin_email: form.email,
          employee_count: form.employee_count,
          status: form.status,
          logo: form.logo || undefined,
          address: form.address || undefined,
          description: form.description || undefined,
          website: form.website || undefined,
          phone: form.phone || undefined,
          tax_id: form.tax_id || undefined,
          registration_number: form.registration_number || undefined,
          industry: form.industry || undefined,
          founded_year: form.founded_year ? Number(form.founded_year) : undefined,
          contacts: Object.keys(form.contacts).length > 0 ? form.contacts : undefined,
        },
      }));
    }
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
          <Typography variant="h5" fontWeight={700}>{t('companies.editCompany')}</Typography>
          <IconButton onClick={onClose}>
            <Icon icon="ph:x" width={28} />
          </IconButton>
        </Box>
        <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={handleSubmit}>
          {/* Main Info */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{t('companies.mainInfo')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.name')} name="name" value={form.name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.adminEmail')} name="email" value={form.email} onChange={handleChange} fullWidth required type="email" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('companies.employeeCount')}</InputLabel>
                <Select
                  name="employee_count"
                  value={form.employee_count}
                  onChange={handleSelectChange}
                  label={t('companies.employeeCount')}
                >
                  {employeeCountOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('companies.status')}</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleSelectChange}
                  label={t('companies.status')}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Address & Logo */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{t('companies.addressAndLogo')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.address')} name="address" value={form.address} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.logo')} name="logo" value={form.logo} onChange={handleChange} fullWidth placeholder="https://example.com/logo.png" />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Company Details */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{t('companies.companyDetails')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label={t('companies.description')} name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.website')} name="website" value={form.website} onChange={handleChange} fullWidth placeholder="https://example.com" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.phone')} name="phone" value={form.phone} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.taxId')} name="tax_id" value={form.tax_id} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.registrationNumber')} name="registration_number" value={form.registration_number} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.industry')} name="industry" value={form.industry} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('companies.foundedYear')} name="founded_year" type="number" value={form.founded_year} onChange={handleChange} fullWidth />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Directories bound to this company */}
          {company?.directories && company.directories.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>{t('companies.boundDirectories')}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {company.directories.map(dir => (
                  <Chip key={dir.id} label={dir.name} icon={dir.icon_name ? <Icon icon={dir.icon_name} width={20} /> : undefined} />
                ))}
              </Stack>
            </Box>
          )}

          {/* Dynamic contacts */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{t('companies.additionalContacts')}</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={5}>
              <TextField
                label={t('companies.contactName')}
                value={newContact.name}
                onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                label={t('companies.contactValue')}
                value={newContact.value}
                onChange={e => setNewContact({ ...newContact, value: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={handleAddContact}
                fullWidth
                sx={{ height: '100%' }}
              >
                {t('common.add')}
              </Button>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(form.contacts).map(([name, value]) => (
              <Chip
                key={name}
                label={`${name}: ${value}`}
                onDelete={() => handleRemoveContact(name)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              sx={{ borderRadius: 999, textTransform: 'none' }}
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}
              type="submit"
            >
              {t('common.saveChanges')}
            </Button>
            <Button
              variant="text"
              sx={{ borderRadius: 999, textTransform: 'none', ml: 2 }}
              onClick={() => setEmployeesDrawerOpen(true)}
            >
              {t('companies.showEmployees')}
            </Button>
          </Box>
        </form>
        <CompanyEmployeesDrawer open={employeesDrawerOpen} onClose={() => setEmployeesDrawerOpen(false)} companyId={company?.id || null} />
      </Box>
    </Drawer>
  );
};

export default EditCompanyDrawer; 