import React, { useState } from 'react';
import { Box, Paper, Typography, Tabs, Tab } from '@mui/material';
import { ReportConfig as ReportConfigType, ReportType } from '../../../types/report';
import UniverSheet from './UniverSheet';
import FormulaBuilder from './FormulaBuilder';
import DataSourceConfig from './DataSourceConfig';
import FilterConfig from './FilterConfig';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ReportConfigProps {
  reportId: string;
  onSave: (config: ReportConfigType) => void;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} style={{ height: '100%' }}>
    {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
  </div>
);

const ReportConfig: React.FC<ReportConfigProps> = ({ reportId, onSave }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [reportConfig, setReportConfig] = useState<ReportConfigType>({
    id: reportId,
    name: '',
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
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConfigUpdate = (updates: Partial<ReportConfigType>) => {
    setReportConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <Paper sx={{ width: '100%', height: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Report Configuration
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Spreadsheet" />
          <Tab label="Data Sources" />
          <Tab label="Formulas" />
          <Tab label="Filters" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <UniverSheet
          structure={reportConfig.structure.spreadsheet}
          onUpdate={(structure) => handleConfigUpdate({ structure: { ...reportConfig.structure, spreadsheet: structure } })}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <DataSourceConfig
          dataSources={reportConfig.dataSources}
          onUpdate={(dataSources) => handleConfigUpdate({ dataSources })}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <FormulaBuilder
          formulas={reportConfig.structure.spreadsheet.formulas}
          onUpdate={(formulas) => handleConfigUpdate({ structure: { ...reportConfig.structure, spreadsheet: { ...reportConfig.structure.spreadsheet, formulas } } })}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <FilterConfig
          filters={reportConfig.filters}
          onUpdate={(filters) => handleConfigUpdate({ filters })}
        />
      </TabPanel>
    </Paper>
  );
};

export default ReportConfig; 