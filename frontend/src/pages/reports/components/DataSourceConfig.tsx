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
import { DataSource } from '../../../types/report';

interface DataSourceConfigProps {
  dataSources: DataSource[];
  onUpdate: (dataSources: DataSource[]) => void;
}

const DataSourceConfig: React.FC<DataSourceConfigProps> = ({ dataSources, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DataSource>>({
    name: '',
    type: 'database',
    config: {},
  });

  const handleAdd = () => {
    if (!formData.name || !formData.type) return;

    const newDataSource: DataSource = {
      id: `datasource_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      config: formData.config || {},
    };

    onUpdate([...dataSources, newDataSource]);

    setFormData({
      name: '',
      type: 'database',
      config: {},
    });
  };

  const handleEdit = (id: string) => {
    const dataSource = dataSources.find((ds) => ds.id === id);
    if (!dataSource) return;

    setEditingId(id);
    setFormData({
      name: dataSource.name,
      type: dataSource.type,
      config: dataSource.config,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.type) return;

    const updatedDataSources = dataSources.map((ds) =>
      ds.id === editingId
        ? {
            ...ds,
            name: formData.name!,
            type: formData.type!,
            config: formData.config || {},
          }
        : ds
    );

    onUpdate(updatedDataSources);

    setEditingId(null);
    setFormData({
      name: '',
      type: 'database',
      config: {},
    });
  };

  const handleDelete = (id: string) => {
    onUpdate(dataSources.filter((ds) => ds.id !== id));
  };

  const handleConfigChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Edit Data Source' : 'Add New Data Source'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Data Source Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Data Source Type</InputLabel>
            <Select
              value={formData.type}
              label="Data Source Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as DataSource['type'] })}
            >
              <MenuItem value="database">Database</MenuItem>
              <MenuItem value="api">API</MenuItem>
              <MenuItem value="file">File</MenuItem>
            </Select>
          </FormControl>

          {formData.type === 'database' && (
            <>
              <TextField
                label="Host"
                value={formData.config?.host || ''}
                onChange={(e) => handleConfigChange('host', e.target.value)}
                fullWidth
              />
              <TextField
                label="Port"
                value={formData.config?.port || ''}
                onChange={(e) => handleConfigChange('port', e.target.value)}
                fullWidth
              />
              <TextField
                label="Database"
                value={formData.config?.database || ''}
                onChange={(e) => handleConfigChange('database', e.target.value)}
                fullWidth
              />
            </>
          )}

          {formData.type === 'api' && (
            <>
              <TextField
                label="URL"
                value={formData.config?.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                fullWidth
              />
              <TextField
                label="Method"
                value={formData.config?.method || ''}
                onChange={(e) => handleConfigChange('method', e.target.value)}
                fullWidth
              />
            </>
          )}

          {formData.type === 'file' && (
            <TextField
              label="File Path"
              value={formData.config?.path || ''}
              onChange={(e) => handleConfigChange('path', e.target.value)}
              fullWidth
            />
          )}

          <Button
            variant="contained"
            onClick={editingId ? handleUpdate : handleAdd}
            disabled={!formData.name || !formData.type}
          >
            {editingId ? 'Update Data Source' : 'Add Data Source'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Existing Data Sources
        </Typography>
        <List>
          {dataSources.map((dataSource) => (
            <ListItem key={dataSource.id}>
              <ListItemText
                primary={dataSource.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Type:
                    </Typography>{' '}
                    {dataSource.type}
                    <br />
                    <Typography component="span" variant="body2" color="text.primary">
                      Configuration:
                    </Typography>{' '}
                    {JSON.stringify(dataSource.config)}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleEdit(dataSource.id)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(dataSource.id)}>
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

export default DataSourceConfig; 