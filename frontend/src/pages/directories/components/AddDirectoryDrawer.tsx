import { createDirectoryStart } from '@/store/slices/directoriesSlice';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import DirectoryFieldsEditor from './DirectoryFieldsEditor';
import { DirectoryField } from '@/api/services/directories';
import KeyValueEditor, { KeyValueObject } from '@/components/KeyValueEditor';

interface AddDirectoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

const AddDirectoryDrawer: React.FC<AddDirectoryDrawerProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: '',
    icon_name: '',
    directory_type: 'Company',
  });
  const [fields, setFields] = useState<DirectoryField[]>([]);
  const [metadata, setMetadata] = useState<KeyValueObject>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createDirectoryStart({ ...form, fields, metadata }));
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
          <Typography variant="h5" fontWeight={700}>{t('directories.addNew')}</Typography>
          <IconButton onClick={onClose}>
            <Icon icon="ph:x" width={28} />
          </IconButton>
        </Box>
        <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={handleSubmit}>
          <TextField label={t('directories.name')} name="name" value={form.name} onChange={handleChange} fullWidth required />
          <TextField label={t('directories.iconName')} name="icon_name" value={form.icon_name} onChange={handleChange} fullWidth required />
          <TextField
            select
            label={t('directories.type')}
            name="directory_type"
            value={form.directory_type}
            onChange={handleChange}
            fullWidth
            required
            SelectProps={{ native: true }}
          >
            <option value="Module">{t('directories.typeOptions.module', 'Module')}</option>
            <option value="Company">{t('directories.typeOptions.company', 'Company')}</option>
            <option value="System">{t('directories.typeOptions.system', 'System')}</option>
          </TextField>
          <DirectoryFieldsEditor fields={fields} onFieldsChange={setFields} />
          <KeyValueEditor
            value={metadata}
            onChange={setMetadata}
            label={t('directories.metadata', 'Metadata')}
          />
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

export default AddDirectoryDrawer; 