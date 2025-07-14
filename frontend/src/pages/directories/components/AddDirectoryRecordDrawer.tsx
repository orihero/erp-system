import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, Box, Typography, Button, TextField, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { DirectoryField } from '@/api/services/directories';
import { fetchDirectoryFieldsStart } from '@/store/slices/directoriesSlice';
import { addDirectoryRecord } from '@/store/slices/directoryRecordsSlice';
import { RootState } from '@/store';

const AddDirectoryRecordDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  companyDirectoryId: string | undefined;
  directoryId?: string;
  onSuccess?: () => void;
}> = ({ open, onClose, companyDirectoryId, directoryId, onSuccess }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { fields, fieldsLoading } = useSelector((state: RootState) => state.directories);
    const fieldId = directoryId || companyDirectoryId;
    const loading = fieldId ? fieldsLoading[fieldId] || false : false;
    const directoryFields = fieldId ? fields[fieldId] || [] : [];

    useEffect(() => {
        if (open && fieldId) {
            dispatch(fetchDirectoryFieldsStart(fieldId));
        }
    }, [open, fieldId, dispatch]);

    const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
    useEffect(() => {
        if (directoryFields.length > 0) {
            const initialFormData = directoryFields.reduce((acc: Record<string, string | number | boolean>, field: DirectoryField) => ({
                ...acc,
                [field.id]: field.type === 'number' ? 0 : field.type === 'boolean' ? false : ''
            }), {});
            setFormData(initialFormData);
        }
    }, [directoryFields]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = () => {
        if (companyDirectoryId) {
            const values = Object.entries(formData).map(([field_id, value]) => ({
                field_id,
                value
            }));
            dispatch(addDirectoryRecord({ companyDirectoryId, values }));
            if (onSuccess) onSuccess();
        }
        onClose();
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 400, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                        {t('directories.records.addNew')}
                    </Typography>
                    <Button onClick={onClose} sx={{ minWidth: 'auto' }}>
                        <Icon icon="ph:x" />
                    </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    {loading ? (
                        <Typography>{t('directories.records.loadingFields', 'Loading fields...')}</Typography>
                    ) : (
                        directoryFields.map((field) => (
                            <TextField
                                key={field.id}
                                fullWidth
                                margin="normal"
                                label={field.name}
                                name={field.id}
                                type={field.type === 'number' ? 'number' : 'text'}
                                value={formData[field.id] || ''}
                                onChange={handleChange}
                                required={field.required}
                            />
                        ))
                    )}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999 }}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" variant="contained" sx={{ borderRadius: 999 }}>
                            {t('common.save')}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Drawer>
    );
};

export default AddDirectoryRecordDrawer;
