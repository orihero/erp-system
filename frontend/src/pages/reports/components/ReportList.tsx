import React from 'react';
import { List, ListItemButton, ListItemText, Paper } from '@mui/material';
import { Report } from '../../../types/report';

interface ReportListProps {
  onSelectReport: (report: Report) => void;
  selectedReportId?: string;
}

const ReportList: React.FC<ReportListProps> = ({ onSelectReport, selectedReportId }) => {
  // TODO: Replace with actual data fetching
  const reports: Report[] = [
    {
      id: 'sales-report',
      name: 'Sales Report',
      description: 'Monthly sales data visualization',
      type: 'chart',
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
    },
    {
      id: 'customer-analytics',
      name: 'Customer Analytics',
      description: 'Customer demographics and behavior analysis',
      type: 'table',
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
    }
  ];

  return (
    <Paper sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
      <List>
        {reports.map((report) => (
          <ListItemButton
            key={report.id}
            selected={report.id === selectedReportId}
            onClick={() => onSelectReport(report)}
          >
            <ListItemText
              primary={report.name}
              secondary={report.description}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default ReportList; 