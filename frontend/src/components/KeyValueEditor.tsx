import React from 'react';
import { Box, TextField, IconButton, MenuItem, Button, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

export type KeyValueType = string | number | boolean;
export type KeyValueObject = Record<string, KeyValueType>;

interface KeyValueEditorProps {
  value: KeyValueObject;
  onChange: (value: KeyValueObject) => void;
  label?: string;
}

const typeOptions = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
];

const KeyValueEditor: React.FC<KeyValueEditorProps> = ({ value, onChange, label }) => {
  const [entries, setEntries] = React.useState<{
    key: string;
    value: KeyValueType;
    type: 'string' | 'number' | 'boolean';
  }[]>([]);
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');
  const [newType, setNewType] = React.useState<'string' | 'number' | 'boolean'>('string');

  React.useEffect(() => {
    setEntries(
      Object.entries(value).map(([k, v]) => {
        let type: 'string' | 'number' | 'boolean' = 'string';
        if (typeof v === 'number') type = 'number';
        else if (typeof v === 'boolean') type = 'boolean';
        return { key: k, value: v, type };
      })
    );
  }, [value]);

  const handleEntryChange = (idx: number, field: 'key' | 'value' | 'type', val: string | number | boolean) => {
    setEntries((prev) => {
      const updated = [...prev];
      const entry = { ...updated[idx] };
      if (field === 'key') entry.key = val as string;
      if (field === 'type') {
        entry.type = val as 'string' | 'number' | 'boolean';
        // Convert value to new type
        if (val === 'number') entry.value = Number(entry.value) || 0;
        else if (val === 'boolean') entry.value = Boolean(entry.value);
        else entry.value = String(entry.value);
      }
      if (field === 'value') {
        if (entry.type === 'number') entry.value = Number(val);
        else if (entry.type === 'boolean') entry.value = val === 'true';
        else entry.value = val;
      }
      updated[idx] = entry;
      onChange(Object.fromEntries(updated.map(e => [e.key, e.value])));
      return updated;
    });
  };

  const handleRemove = (idx: number) => {
    const updated = entries.filter((_, i) => i !== idx);
    setEntries(updated);
    onChange(Object.fromEntries(updated.map(e => [e.key, e.value])));
  };

  const handleAdd = () => {
    if (!newKey) return;
    let val: KeyValueType = newValue;
    if (newType === 'number') val = Number(newValue) || 0;
    else if (newType === 'boolean') val = newValue === 'true';
    const updated = [...entries, { key: newKey, value: val, type: newType }];
    setEntries(updated);
    onChange(Object.fromEntries(updated.map(e => [e.key, e.value])));
    setNewKey('');
    setNewValue('');
    setNewType('string');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {label && <Typography fontWeight={600}>{label}</Typography>}
      {entries.map((entry, idx) => (
        <Box key={entry.key + idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label="Key"
            value={entry.key}
            onChange={e => handleEntryChange(idx, 'key', e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          />
          <TextField
            select
            label="Type"
            value={entry.type}
            onChange={e => handleEntryChange(idx, 'type', e.target.value)}
            size="small"
            sx={{ minWidth: 100 }}
          >
            {typeOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          {entry.type === 'boolean' ? (
            <TextField
              select
              label="Value"
              value={String(entry.value)}
              onChange={e => handleEntryChange(idx, 'value', e.target.value)}
              size="small"
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="true">true</MenuItem>
              <MenuItem value="false">false</MenuItem>
            </TextField>
          ) : (
            <TextField
              label="Value"
              value={entry.value}
              onChange={e => handleEntryChange(idx, 'value', e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
              type={entry.type === 'number' ? 'number' : 'text'}
            />
          )}
          <IconButton onClick={() => handleRemove(idx)} color="error">
            <Icon icon="ph:trash" />
          </IconButton>
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
        <TextField
          label="Key"
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        />
        <TextField
          select
          label="Type"
          value={newType}
          onChange={e => setNewType(e.target.value as 'string' | 'number' | 'boolean')}
          size="small"
          sx={{ minWidth: 100 }}
        >
          {typeOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        {newType === 'boolean' ? (
          <TextField
            select
            label="Value"
            value={String(newValue)}
            onChange={e => setNewValue(e.target.value)}
            size="small"
            sx={{ minWidth: 100 }}
          >
            <MenuItem value="true">true</MenuItem>
            <MenuItem value="false">false</MenuItem>
          </TextField>
        ) : (
          <TextField
            label="Value"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
            type={newType === 'number' ? 'number' : 'text'}
          />
        )}
        <Button onClick={handleAdd} variant="contained" sx={{ minWidth: 40, borderRadius: 999, bgcolor: '#3b82f6' }}>
          <Icon icon="ph:plus" />
        </Button>
      </Box>
    </Box>
  );
};

export default KeyValueEditor; 