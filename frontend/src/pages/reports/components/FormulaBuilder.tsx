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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { FormulaDefinition } from '../../../types/report';

interface FormulaBuilderProps {
  formulas: Record<string, FormulaDefinition>;
  onUpdate: (formulas: Record<string, FormulaDefinition>) => void;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({ formulas, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FormulaDefinition>>({
    name: '',
    formula: '',
    parameters: [],
  });

  const handleAdd = () => {
    if (!formData.name || !formData.formula) return;

    const newFormula: FormulaDefinition = {
      id: `formula_${Date.now()}`,
      name: formData.name,
      formula: formData.formula,
      parameters: formData.parameters || [],
    };

    onUpdate({
      ...formulas,
      [newFormula.id]: newFormula,
    });

    setFormData({
      name: '',
      formula: '',
      parameters: [],
    });
  };

  const handleEdit = (id: string) => {
    const formula = formulas[id];
    setEditingId(id);
    setFormData({
      name: formula.name,
      formula: formula.formula,
      parameters: formula.parameters,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.formula) return;

    const updatedFormula: FormulaDefinition = {
      id: editingId,
      name: formData.name,
      formula: formData.formula,
      parameters: formData.parameters || [],
    };

    onUpdate({
      ...formulas,
      [editingId]: updatedFormula,
    });

    setEditingId(null);
    setFormData({
      name: '',
      formula: '',
      parameters: [],
    });
  };

  const handleDelete = (id: string) => {
    const newFormulas = { ...formulas };
    delete newFormulas[id];
    onUpdate(newFormulas);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Edit Formula' : 'Add New Formula'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Formula Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Formula"
            value={formData.formula}
            onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Parameters (comma-separated)"
            value={formData.parameters?.join(', ')}
            onChange={(e) =>
              setFormData({
                ...formData,
                parameters: e.target.value.split(',').map((p) => p.trim()),
              })
            }
            fullWidth
          />
          <Button
            variant="contained"
            onClick={editingId ? handleUpdate : handleAdd}
            disabled={!formData.name || !formData.formula}
          >
            {editingId ? 'Update Formula' : 'Add Formula'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Existing Formulas
        </Typography>
        <List>
          {Object.entries(formulas).map(([id, formula]) => (
            <ListItem key={id}>
              <ListItemText
                primary={formula.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Formula:
                    </Typography>{' '}
                    {formula.formula}
                    {formula.parameters.length > 0 && (
                      <>
                        <br />
                        <Typography component="span" variant="body2" color="text.primary">
                          Parameters:
                        </Typography>{' '}
                        {formula.parameters.join(', ')}
                      </>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleEdit(id)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(id)}>
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

export default FormulaBuilder; 