import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (chartData: unknown) => void;
  selectedRange: string;
  spreadsheetData: unknown;
}

const ChartDialog: React.FC<ChartDialogProps> = ({
  open,
  onClose,
  onSave,
  selectedRange,
  spreadsheetData,
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [chartTitle, setChartTitle] = useState('');
  const [chartData, setChartData] = useState<unknown>(null);

  useEffect(() => {
    console.log('ChartDialog mounted/updated:', {
      open,
      selectedRange,
      spreadsheetData,
      chartType,
      chartTitle,
      chartData
    });

    if (open && selectedRange && spreadsheetData) {
      processData();
    }
  }, [open, selectedRange, spreadsheetData, chartType]);

  const processData = () => {
    console.log('Processing data for chart:', {
      selectedRange,
      spreadsheetData,
      chartType
    });

    if (!spreadsheetData || !spreadsheetData[0]?.data) {
      console.error('No data available for chart');
      return;
    }

    try {
      // Extract data from the selected range
      const [startRow, startCol] = selectedRange.split(':').map(Number);
      const data = spreadsheetData[0].data;
      
      console.log('Raw data:', data);

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
        .map(key => {
          const value = data[key].text;
          return value ? Number(value) : 0;
        });

      console.log('Processed data:', {
        headers,
        values,
        startRow,
        startCol
      });

      if (headers.length === 0 || values.length === 0) {
        console.error('No valid data found for chart');
        return;
      }

      // Prepare chart data based on type
      let chartConfig;
      switch (chartType) {
        case 'line':
        case 'bar':
          chartConfig = {
            labels: headers,
            datasets: [{
              label: chartTitle || 'Data',
              data: values,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }],
          };
          break;
        case 'pie':
          chartConfig = {
            labels: headers,
            datasets: [{
              data: values,
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
              ],
            }],
          };
          break;
      }

      console.log('Chart configuration:', chartConfig);
      setChartData(chartConfig);
    } catch (error) {
      console.error('Error processing chart data:', error);
    }
  };

  const handleSave = () => {
    console.log('Saving chart configuration:', {
      type: chartType,
      title: chartTitle,
      data: chartData,
      range: selectedRange
    });
    
    onSave({
      type: chartType,
      title: chartTitle,
      data: chartData,
      range: selectedRange,
    });
    onClose();
  };

  const renderChart = () => {
    console.log('Rendering chart:', {
      type: chartType,
      data: chartData
    });

    if (!chartData) {
      console.log('No chart data available');
      return null;
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: chartTitle || 'Chart',
        },
      },
    };

    try {
      switch (chartType) {
        case 'line':
          return <Line data={chartData} options={options} />;
        case 'bar':
          return <Bar data={chartData} options={options} />;
        case 'pie':
          return <Pie data={chartData} options={options} />;
        default:
          console.error('Unknown chart type:', chartType);
          return null;
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
      return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{t('reports.chartDialog.createChart', 'Create Chart')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{t('reports.chartDialog.chartType', 'Chart Type')}</InputLabel>
            <Select
              value={chartType}
              label={t('reports.chartDialog.chartType', 'Chart Type')}
              onChange={(e) => setChartType(e.target.value as 'line' | 'bar' | 'pie')}
            >
              <MenuItem value="line">{t('reports.chartDialog.lineChart', 'Line Chart')}</MenuItem>
              <MenuItem value="bar">{t('reports.chartDialog.barChart', 'Bar Chart')}</MenuItem>
              <MenuItem value="pie">{t('reports.chartDialog.pieChart', 'Pie Chart')}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={t('reports.chartDialog.chartTitle', 'Chart Title')}
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            fullWidth
          />

          <Box sx={{ height: 300, mt: 2 }}>
            {renderChart()}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Chart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChartDialog; 