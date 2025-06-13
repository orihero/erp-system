import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Menu, MenuItem, IconButton, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Spreadsheet from 'x-data-spreadsheet';
import 'x-data-spreadsheet/dist/xspreadsheet.css';
import ChartDialog from './ChartDialog';
import { Line, Bar, Pie } from 'react-chartjs-2';

interface ChartData {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: any;
  range: string;
}

const FullScreenSpreadsheet: React.FC = () => {
  const navigate = useNavigate();
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const spreadsheetInstanceRef = useRef<Spreadsheet | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRange, setSelectedRange] = React.useState<string>('');
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    if (!spreadsheetRef.current) return;

    const options = {
      mode: 'edit' as const,
      showToolbar: true,
      showGrid: true,
      showContextmenu: true,
      view: {
        height: () => document.documentElement.clientHeight - 100,
        width: () => document.documentElement.clientWidth,
      },
      row: {
        len: 100,
        height: 25,
      },
      style: {
        bgcolor: '#ffffff',
        align: 'left' as const,
        valign: 'middle' as const,
        textwrap: false,
        strike: false,
        underline: false,
        color: '#0a0a0a',
        font: {
          name: 'Helvetica',
          size: 10,
          bold: false,
          italic: false,
        },
      },
    };

    const spreadsheet = new Spreadsheet(spreadsheetRef.current, options);
    spreadsheetInstanceRef.current = spreadsheet;

    // Handle cell selection for chart creation
    spreadsheet.on('cell-selected', (cell: unknown, rowIndex: number, colIndex: number) => {
      console.log('Cell selected:', { cell, rowIndex, colIndex });
      const range = `${rowIndex + 1}:${colIndex + 1}`;
      setSelectedRange(range);
    });

    // Handle range selection
    spreadsheet.on('range-selected', (range: { start: { row: number; col: number }, end: { row: number; col: number } }) => {
      console.log('Range selected:', range);
      if (range && range.start && range.end) {
        const startRow = range.start.row + 1;
        const startCol = range.start.col + 1;
        const endRow = range.end.row + 1;
        const endCol = range.end.col + 1;
        const rangeStr = `${startRow}:${startCol}`;
        console.log('Setting selected range:', rangeStr);
        setSelectedRange(rangeStr);
      }
    });

    return () => {
      // Remove the spreadsheet instance
      if (spreadsheetRef.current) {
        const container = spreadsheetRef.current;
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
      spreadsheetInstanceRef.current = null;
    };
  }, []);

  const handleChartMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    console.log('Chart menu opened');
    setAnchorEl(event.currentTarget);
  };

  const handleChartMenuClose = () => {
    console.log('Chart menu closed');
    setAnchorEl(null);
  };

  const handleCreateChart = (chartType: 'line' | 'bar' | 'pie') => {
    console.log('Creating chart of type:', chartType);
    console.log('Selected range:', selectedRange);
    
    if (!selectedRange) {
      console.error('No range selected for chart creation');
      return;
    }

    const spreadsheetData = spreadsheetInstanceRef.current?.getData();
    console.log('Current spreadsheet data:', spreadsheetData);

    // Check if we have valid data
    if (!spreadsheetData || !Array.isArray(spreadsheetData) || spreadsheetData.length === 0) {
      console.error('Invalid spreadsheet data structure');
      return;
    }

    const data = spreadsheetData[0]?.data;
    if (!data || typeof data !== 'object') {
      console.error('No data object found in spreadsheet');
      return;
    }

    // Extract data from the selected range
    const [startRow, startCol] = selectedRange.split(':').map(Number);
    
    // Get headers (first row)
    const headers = Object.keys(data)
      .filter(key => {
        const [row] = key.split('_').map(Number);
        return row === startRow;
      })
      .map(key => data[key].text || '');

    // Get values (subsequent rows)
    const values = Object.keys(data)
      .filter(key => {
        const [row, col] = key.split('_').map(Number);
        return row > startRow && col >= startCol;
      })
      .map(key => data[key].text || '');

    console.log('Extracted data:', {
      headers,
      values,
      startRow,
      startCol,
      dataKeys: Object.keys(data)
    });

    if (headers.length === 0 || values.length === 0) {
      console.error('No valid data found in selected range');
      return;
    }

    handleChartMenuClose();
    console.log('Opening chart dialog');
    setChartDialogOpen(true);
  };

  const handleChartSave = (chartData: ChartData) => {
    console.log('Saving chart data:', chartData);
    setCharts(prevCharts => {
      const newCharts = [...prevCharts, chartData];
      console.log('Updated charts:', newCharts);
      return newCharts;
    });
    setShowCharts(true);
  };

  const handleSave = () => {
    if (spreadsheetInstanceRef.current) {
      const data = spreadsheetInstanceRef.current.getData();
      const reportData = {
        spreadsheet: data,
        charts: charts,
      };
      console.log('Report structure data:', reportData);
      // TODO: Save report data to backend
    }
    navigate('/reports');
  };

  const renderChart = (chart: ChartData) => {
    console.log('Rendering chart:', chart);

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: chart.title,
        },
      },
    };

    try {
      switch (chart.type) {
        case 'line':
          return <Line data={chart.data} options={options} />;
        case 'bar':
          return <Bar data={chart.data} options={options} />;
        case 'pie':
          return <Pie data={chart.data} options={options} />;
        default:
          console.error('Unknown chart type:', chart.type);
          return null;
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
      return null;
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#fff'
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" component="h1">
          Report Structure
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton
            onClick={handleChartMenuOpen}
            title="Create Chart"
          >
            <Icon icon="solar:chart-2-linear" width={24} height={24} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleChartMenuClose}
          >
            <MenuItem onClick={() => handleCreateChart('line')}>Line Chart</MenuItem>
            <MenuItem onClick={() => handleCreateChart('bar')}>Bar Chart</MenuItem>
            <MenuItem onClick={() => handleCreateChart('pie')}>Pie Chart</MenuItem>
          </Menu>
          <Button
            variant="outlined"
            startIcon={<Icon icon="solar:close-circle-linear" />}
            onClick={() => window.close()}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon icon="solar:save-linear" />}
            onClick={handleSave}
          >
            Save Report Structure
          </Button>
        </Box>
      </Box>

      <Box sx={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {showCharts && charts.length > 0 && (
          <Box sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 2,
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#f5f5f5',
            maxHeight: '40vh',
            overflow: 'auto',
          }}>
            {charts.map((chart, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 300,
                  position: 'relative',
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {chart.title}
                </Typography>
                <Box sx={{ flex: 1, position: 'relative' }}>
                  {renderChart(chart)}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <div ref={spreadsheetRef} style={{ height: '100%', width: '100%' }} />
        </Box>
      </Box>

      {chartDialogOpen && (
        <ChartDialog
          open={chartDialogOpen}
          onClose={() => setChartDialogOpen(false)}
          onSave={handleChartSave}
          selectedRange={selectedRange}
          spreadsheetData={spreadsheetInstanceRef.current?.getData()}
        />
      )}
    </Box>
  );
};

export default FullScreenSpreadsheet; 