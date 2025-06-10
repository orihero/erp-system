import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Filter } from '../../../types/report';

interface FilterConfigProps {
  filters: Filter[];
  onUpdate: (filters: Filter[]) => void;
}

const FilterConfig: React.FC<FilterConfigProps> = ({ filters, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Filter>>({
    field: '',
    operator: 'equals',
    value: '',
  });

  const handleAdd = () => {
    if (!formData.field || !formData.operator) return;

    const newFilter: Filter = {
      id: `filter_${Date.now()}`,
      field: formData.field,
      operator: formData.operator,
      value: formData.value || '',
    };

    onUpdate([...filters, newFilter]);

    setFormData({
      field: '',
      operator: 'equals',
      value: '',
    });
  };

  const handleEdit = (id: string) => {
    const filter = filters.find((f) => f.id === id);
    if (!filter) return;

    setEditingId(id);
    setFormData({
      field: filter.field,
      operator: filter.operator,
      value: filter.value,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.field || !formData.operator) return;

    const updatedFilters = filters.map((f) =>
      f.id === editingId
        ? {
            ...f,
            field: formData.field!,
            operator: formData.operator!,
            value: formData.value || '',
          }
        : f
    );

    onUpdate(updatedFilters);

    setEditingId(null);
    setFormData({
      field: '',
      operator: 'equals',
      value: '',
    });
  };

  const handleDelete = (id: string) => {
    onUpdate(filters.filter((f) => f.id !== id));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Edit Filter' : 'Add New Filter'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Field Name"
            value={formData.field}
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Operator</InputLabel>
            <Select
              value={formData.operator}
              label="Operator"
              onChange={(e) => setFormData({ ...formData, operator: e.target.value as Filter['operator'] })}
            >
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="greaterThan">Greater Than</MenuItem>
              <MenuItem value="lessThan">Less Than</MenuItem>
              <MenuItem value="between">Between</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            fullWidth
            multiline={formData.operator === 'between'}
            rows={formData.operator === 'between' ? 2 : 1}
            helperText={
              formData.operator === 'between'
                ? 'Enter two values separated by a comma'
                : undefined
            }
          />
          <Button
            variant="contained"
            onClick={editingId ? handleUpdate : handleAdd}
            disabled={!formData.field || !formData.operator}
          >
            {editingId ? 'Update Filter' : 'Add Filter'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Existing Filters
        </Typography>
        <List>
          {filters.map((filter) => (
            <ListItem key={filter.id}>
              <ListItemText
                primary={`${filter.field} ${filter.operator} ${filter.value}`}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Filter ID: {filter.id}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleEdit(filter.id)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(filter.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default FilterConfig; 