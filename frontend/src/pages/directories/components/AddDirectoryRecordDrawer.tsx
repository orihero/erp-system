import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, Box, Typography, Button, TextField, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { DirectoryField } from '@/api/services/directories';
import { fetchDirectoryFieldsStart } from '@/store/slices/directoriesSlice';
import { addDirectoryRecord } from '@/store/slices/directoryRecordsSlice';
import { RootState } from '@/store';
import { DatePicker, TimePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import KeyValueEditor from '@/components/KeyValueEditor';
import RelationField from '@/components/RelationField';
// Removed unused useDirectoryRecords import

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

    // Replace all 'any' usages for formData with a proper type
    const [formData, setFormData] = useState<Record<string, string | number | boolean | Date | null | undefined | object>>({});
    useEffect(() => {
        if (directoryFields.length > 0) {
            const initialFormData = directoryFields.reduce((acc: Record<string, string | number | boolean | Date | null | undefined | object>, field: DirectoryField) => {
                let initialValue: string | number | boolean | Date | null | undefined | object = undefined;
                if (field.type === 'number') initialValue = 0;
                else if (field.type === 'boolean') initialValue = false;
                else if (field.type === 'file') initialValue = undefined;
                else if (field.type === 'date') initialValue = undefined;
                else if (field.type === 'time') initialValue = undefined;
                else if (field.type === 'datetime') initialValue = undefined;
                else if (field.type === 'json') initialValue = {};
                else if (field.type === 'relation') initialValue = '';
                else initialValue = '';
                return {
                    ...acc,
                    [field.id]: initialValue
                };
            }, {} as Record<string, string | number | boolean | Date | null | undefined | object>);
            setFormData(initialFormData);
        }
    }, [directoryFields]);

    // Fetch relation options for all relation fields when fields change
    useEffect(() => {
        const fetchRelations = async () => {
            const options: Record<string, Array<{ id: string; label: string }>> = {};
            for (const field of directoryFields) {
                if (field.type === 'relation' && field.relation_id && companyDirectoryId) {
                    try {
                        const res = await fetch(`/api/directory-records/full-data?directory_id=${field.relation_id}&company_id=${companyDirectoryId}`);
                        const data = await res.json();
                        options[field.id] = (data.directoryRecords || []).map((rec: { id: string }) => ({ id: rec.id, label: String(rec.id) }));
                    } catch {
                        options[field.id] = [];
                    }
                }
            }
            // setRelationOptions(options); // This line was removed as per the edit hint
        };
        if (directoryFields.some(f => f.type === 'relation')) {
            fetchRelations();
        }
    }, [directoryFields, companyDirectoryId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev: Record<string, string | number | boolean | Date | null | undefined | object>) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = () => {
        if (companyDirectoryId) {
            const values = Object.entries(formData).map(([field_id, value]) => {
                let v: string | number | boolean = '';
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    v = value;
                } else if (value instanceof Date) {
                    v = value.toISOString();
                } else if (typeof value === 'object' && value !== null) {
                    v = JSON.stringify(value);
                }
                return { field_id, value: v };
            });
            dispatch(addDirectoryRecord({ companyDirectoryId, values }));
            if (onSuccess) onSuccess();
        }
        onClose();
    };

    const renderField = (field: DirectoryField) => {
        // Boolean
        if (field.type === 'bool' || field.type === 'boolean') {
            return (
                <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                    <input
                        type="checkbox"
                        name={field.id}
                        checked={!!formData[field.id]}
                        onChange={e => setFormData((prev: Record<string, string | number | boolean | Date | null | undefined | object>) => ({ ...prev, [field.id]: e.target.checked }))}
                        id={`checkbox-${field.id}`}
                        style={{ marginRight: 8 }}
                    />
                    <label htmlFor={`checkbox-${field.id}`}>{field.name}</label>
                </Box>
            );
        }
        // File
        if (field.type === 'file') {
            return (
                <TextField
                    key={field.id}
                    fullWidth
                    margin="normal"
                    label={field.name}
                    name={field.id}
                    type="file"
                    onChange={e => setFormData((prev: Record<string, string | number | boolean | Date | null | undefined | object>) => ({ ...prev, [field.id]: (e.target as HTMLInputElement).files?.[0] }))}
                    required={field.required}
                    InputLabelProps={{ shrink: true }}
                />
            );
        }
        // Date
        if (field.type === 'date') {
            return (
                <LocalizationProvider key={field.id} dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label={field.name}
                        value={formData[field.id] ? (formData[field.id] as Date) : null}
                        onChange={val => setFormData((prev: Record<string, string | number | boolean | Date | null | undefined | object>) => ({ ...prev, [field.id]: val }))}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal', required: field.required } }}
                    />
                </LocalizationProvider>
            );
        }
        // Time
        if (field.type === 'time') {
            return (
                <LocalizationProvider key={field.id} dateAdapter={AdapterDateFns}>
                    <TimePicker
                        label={field.name}
                        value={formData[field.id] ? (formData[field.id] as Date) : null}
                        onChange={val => setFormData((prev: Record<string, string | number | boolean | Date | null | undefined | object>) => ({ ...prev, [field.id]: val }))}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal', required: field.required } }}
                    />
                </LocalizationProvider>
            );
        }
        // Datetime
        if (field.type === 'datetime') {
            return (
                <LocalizationProvider key={field.id} dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                        label={field.name}
                        value={formData[field.id] ? (formData[field.id] as Date) : null}
                        onChange={val => setFormData((prev: Record<string, string | number | boolean | Date | null | undefined | object>) => ({ ...prev, [field.id]: val }))}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal', required: field.required } }}
                    />
                </LocalizationProvider>
            );
        }
        // JSON
        if (field.type === 'json') {
            return (
                <Box key={field.id} sx={{ my: 2 }}>
                    <Typography fontWeight={600}>{field.name}</Typography>
                    <KeyValueEditor
                        value={typeof formData[field.id] === 'object' && formData[field.id] !== null ? (formData[field.id] as Record<string, string | number | boolean>) : {}}
                        onChange={val => setFormData((prev: Record<string, string | number | boolean | Date | null | undefined | object>) => ({ ...prev, [field.id]: val }))}
                    />
                </Box>
            );
        }
        // Relation
        if (field.type === 'relation' && field.relation_id && companyDirectoryId) {
            return (
                <RelationField
                    key={field.id}
                    relationDirectoryId={field.relation_id}
                    companyId={companyDirectoryId}
                    value={formData[field.id] !== undefined && formData[field.id] !== null ? String(formData[field.id]) : ''}
                    onChange={val => setFormData((prev: Record<string, string | number | boolean | Date | null | undefined | object>) => ({ ...prev, [field.id]: val }))}
                    required={field.required}
                    currentDirectoryId={directoryId}
                    label={field.name}
                />
            );
        }
        // Decimal/Integer/Number
        if (field.type === 'decimal' || field.type === 'integer' || field.type === 'number') {
            return (
                <TextField
                    key={field.id}
                    fullWidth
                    margin="normal"
                    label={field.name}
                    name={field.id}
                    type="number"
                    value={formData[field.id] || ''}
                    onChange={handleChange}
                    required={field.required}
                    inputProps={field.type === 'decimal' ? { step: '0.01' } : {}}
                />
            );
        }
        // Text/String (default)
        return (
            <TextField
                key={field.id}
                fullWidth
                margin="normal"
                label={field.name}
                name={field.id}
                type="text"
                value={formData[field.id] !== undefined && formData[field.id] !== null ? String(formData[field.id]) : ''}
                onChange={handleChange}
                required={field.required}
            />
        );
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
                        directoryFields.map(renderField)
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
