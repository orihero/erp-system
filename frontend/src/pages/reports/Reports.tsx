import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import { Report } from '../../types/report';
import ReportConfig from './components/ReportConfig';
import ReportList from './components/ReportList';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    description: ''
  });

  const handleCreateReport = () => {
    const report: Report = {
      id: Date.now().toString(),
      name: newReport.name,
      description: newReport.description,
      type: 'custom',
      dataSources: [],
      filters: [],
      structure: {
        spreadsheet: {
          cells: {},
          formulas: {}
        },
        charts: [],
        pivots: []
      }
    };
    setSelectedReport(report);
    setIsCreateDialogOpen(false);
    setNewReport({ name: '', description: '' });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} lg={3}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create Report Structure
            </Button>
          </Box>
          <ReportList
            onSelectReport={setSelectedReport}
            selectedReportId={selectedReport?.id}
          />
        </Grid>
        <Grid item xs={12} md={8} lg={9}>
          {selectedReport ? (
            <ReportConfig
              reportId={selectedReport.id}
              onSave={(config) => {
                setSelectedReport((prev: Report | null) => prev ? { ...prev, ...config } : null);
              }}
            />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              Select a report or create a new one to get started
            </Box>
          )}
        </Grid>
      </Grid>

      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogTitle>Create New Report</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Report Name"
            fullWidth
            value={newReport.name}
            onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newReport.description}
            onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateReport}
            variant="contained"
            disabled={!newReport.name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 