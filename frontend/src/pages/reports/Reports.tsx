import React from 'react';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

const Reports: React.FC = () => {
  const navigate = useNavigate();

  const reportTypes = [
    {
      title: 'Financial Reports',
      icon: 'solar:chart-2-linear',
      description: 'View and analyze financial data, including revenue, expenses, and profit margins.',
      type: 'financial'
    },
    {
      title: 'Inventory Reports',
      icon: 'solar:box-linear',
      description: 'Track inventory levels, stock movements, and product performance.',
      type: 'inventory'
    },
    {
      title: 'Sales Reports',
      icon: 'solar:chart-line-linear',
      description: 'Analyze sales performance, customer trends, and revenue metrics.',
      type: 'sales'
    }
  ];

  const handleCreateReport = () => {
    window.open('/reports/create/fullscreen', '_blank');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="solar:add-circle-linear" />}
          onClick={handleCreateReport}
        >
          Create Report Structure
        </Button>
      </Box>

      <Grid container spacing={3}>
        {reportTypes.map((report) => (
          <Grid item key={report.type} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(`/reports/${report.type}`)}
            >
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Icon icon={report.icon} width={48} height={48} />
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {report.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {report.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Reports; 