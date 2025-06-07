import React from 'react';
import { Box, Typography, Button, Grid, Chip, Stack, Avatar, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CompanyEmployeesTable from './CompanyEmployeesTable';
import type { Company } from '@/api/services/companies';

interface AboutTabProps {
  company: Company | undefined;
  onEdit: () => void;
}

const AboutTab: React.FC<AboutTabProps> = ({ company, onEdit }) => {
  const { t } = useTranslation();
  if (!company) return <Box p={3}>{t('companies.notFound', 'Company not found.')}</Box>;
  return (
    <Box p={3}>
      <Grid container spacing={3} alignItems="center">
        <Grid item>
          {company.logo ? (
            <Avatar src={company.logo} alt={company.name} sx={{ width: 80, height: 80 }} />
          ) : (
            <Avatar sx={{ width: 80, height: 80 }}>{company.name?.[0]}</Avatar>
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Typography variant="h5" fontWeight={700}>{company.name}</Typography>
          <Typography color="text.secondary">{company.status}</Typography>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={onEdit}>{t('common.edit')}</Button>
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      {/* General Info */}
      <Typography variant="subtitle1" fontWeight={600} mb={1}>{t('companies.generalInfo', 'General Info')}</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}><b>{t('companies.employeeCount')}:</b> {company.employee_count}</Grid>
        <Grid item xs={12} md={6}><b>{t('companies.industry')}:</b> {company.industry}</Grid>
        <Grid item xs={12} md={6}><b>{t('companies.foundedYear')}:</b> {company.founded_year}</Grid>
      </Grid>
      {/* Contact Info */}
      <Typography variant="subtitle1" fontWeight={600} mb={1}>{t('companies.contactInfo', 'Contact Info')}</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}><b>{t('companies.email')}:</b> {company.email}</Grid>
        <Grid item xs={12} md={6}><b>{t('companies.phone')}:</b> {company.phone}</Grid>
        <Grid item xs={12} md={6}><b>{t('companies.address')}:</b> {company.address}</Grid>
        <Grid item xs={12} md={6}><b>{t('companies.website')}:</b> {company.website}</Grid>
      </Grid>
      {/* Registration */}
      <Typography variant="subtitle1" fontWeight={600} mb={1}>{t('companies.registration', 'Registration')}</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}><b>{t('companies.taxId')}:</b> {company.tax_id}</Grid>
        <Grid item xs={12} md={6}><b>{t('companies.registrationNumber')}:</b> {company.registration_number}</Grid>
      </Grid>
      {/* Description */}
      {company.description && (
        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>{t('companies.description')}</Typography>
          <Typography>{company.description}</Typography>
        </Box>
      )}
      {/* Additional Contacts */}
      {company.contacts && Object.keys(company.contacts).length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>{t('companies.additionalContacts')}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(company.contacts).map(([name, value]) => (
              <Chip key={name} label={`${name}: ${value}`} />
            ))}
          </Stack>
        </Box>
      )}
      {/* Employees Table */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight={600} mb={1}>{t('companies.employees', 'Employees')}</Typography>
      <CompanyEmployeesTable companyId={company.id} />
    </Box>
  );
};

export default AboutTab; 