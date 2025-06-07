import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { addCompanyStart } from '@/store/slices/companiesSlice';
import { AppDispatch } from '@/store';
import { Company } from '@/api/services/companies';

interface AddCompanyDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface Contact {
  name: string;
  value: string;
}

interface CompanyForm {
  name: string;
  admin_email: string;
  employee_count: string;
  logo: string;
  address: string;
  description: string;
  website: string;
  phone: string;
  tax_id: string;
  registration_number: string;
  industry: string;
  founded_year: string;
  contacts: Record<string, string>;
}

const employeeCountOptions = [
  { value: 'less_than_10', label: 'companies.employeeCountOptions.lessThan10' },
  { value: '10_to_50', label: 'companies.employeeCountOptions.10to50' },
  { value: '50_to_100', label: 'companies.employeeCountOptions.50to100' },
  { value: '100_to_500', label: 'companies.employeeCountOptions.100to500' },
  { value: '500_to_1000', label: 'companies.employeeCountOptions.500to1000' },
  { value: 'more_than_1000', label: 'companies.employeeCountOptions.moreThan1000' },
];

const AddCompanyDrawer: React.FC<AddCompanyDrawerProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState<CompanyForm>({
    name: '',
    admin_email: '',
    employee_count: 'less_than_10',
    logo: '',
    address: '',
    description: '',
    website: '',
    phone: '',
    tax_id: '',
    registration_number: '',
    industry: '',
    founded_year: '',
    contacts: {}
  });
  const [newContact, setNewContact] = useState<Contact>({ name: '', value: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
    setForm({
      ...form,
      contacts: newContacts
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const companyData: Omit<Company, 'id'> = {
      name: form.name,
      email: form.admin_email,
      employee_count: parseInt(form.employee_count),
      status: 'active'
    };
    dispatch(addCompanyStart(companyData));
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
          <Typography variant="h5" fontWeight={700}>{t('companies.addNew')}</Typography>
          <IconButton onClick={onClose}>
            <Icon icon="ph:x" width={28} />
          </IconButton>
        </Box>
        <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }} onSubmit={handleSubmit}>
          {/* Main Info */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{t('companies.mainInfo')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.name')}
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.adminEmail')}
                name="admin_email"
                type="email"
                value={form.admin_email}
                onChange={handleChange}
                fullWidth
                required
              />
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
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Address & Logo */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{t('companies.addressAndLogo')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.address')}
                name="address"
                value={form.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.logo')}
                name="logo"
                value={form.logo}
                onChange={handleChange}
                fullWidth
                placeholder="https://example.com/logo.png"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Company Details */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{t('companies.companyDetails')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label={t('companies.description')}
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.website')}
                name="website"
                value={form.website}
                onChange={handleChange}
                fullWidth
                placeholder="https://example.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.phone')}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.taxId')}
                name="tax_id"
                value={form.tax_id}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.registrationNumber')}
                name="registration_number"
                value={form.registration_number}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.industry')}
                name="industry"
                value={form.industry}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('companies.foundedYear')}
                name="founded_year"
                type="number"
                value={form.founded_year}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Additional Contacts */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{t('companies.additionalContacts')}</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={5}>
              <TextField
                label={t('companies.contactName')}
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                label={t('companies.contactValue')}
                value={newContact.value}
                onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
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

          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>
              {t('common.saveChanges')}
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default AddCompanyDrawer; 