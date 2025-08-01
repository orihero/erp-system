import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import CascadingFieldSelector, { CascadingSelection } from '@/components/CascadingFieldSelector';
import { cascadingApi } from '@/api/services/cascading';

const CascadingTest: React.FC = () => {
  const [paymentType, setPaymentType] = useState('');
  const [cascadingSelections, setCascadingSelections] = useState<CascadingSelection[]>([]);
  const [formData, setFormData] = useState({
    receiptNumber: '',
    date: '',
    customerName: '',
    totalAmount: ''
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const paymentTypes = [
    { value: 'delivery_of_services', label: 'Delivery of Services' },
    { value: 'buying_raw_material', label: 'Buying Raw Material' },
    { value: 'employee_salary', label: 'Employee Salary' }
  ];

  const handlePaymentTypeChange = (value: string) => {
    setPaymentType(value);
    setCascadingSelections([]); // Reset cascading selections when payment type changes
  };

  const handleCascadingSelectionChange = (selections: CascadingSelection[]) => {
    setCascadingSelections(selections);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentType) {
      setSnackbar({
        open: true,
        message: 'Please select a payment type',
        severity: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      // For demo purposes, we'll use a mock company directory ID
      // In a real application, this would come from the current context
      const mockCompanyDirectoryId = 'demo-company-directory-id';
      const mockParentFieldId = 'demo-parent-field-id';

      const request = {
        companyDirectoryId: mockCompanyDirectoryId,
        parentFieldId: mockParentFieldId,
        parentValue: paymentType,
        cascadingSelections: cascadingSelections.map(selection => ({
          fieldName: selection.fieldName,
          value: selection.value,
          displayName: selection.displayName
        }))
      };

      const response = await cascadingApi.saveCascadingValues(request);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Receipt saved successfully with cascading values!',
          severity: 'success'
        });
        
        // Reset form
        setFormData({
          receiptNumber: '',
          date: '',
          customerName: '',
          totalAmount: ''
        });
        setPaymentType('');
        setCascadingSelections([]);
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to save receipt',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving receipt:', error);
      setSnackbar({
        open: true,
        message: 'Error saving receipt. Please try again.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Cascading Field Selector Test
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Receipt Form with Cascading Fields
        </Typography>
        
        <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Receipt Number"
            value={formData.receiptNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
            fullWidth
            required
          />
          
          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            label="Customer Name"
            value={formData.customerName}
            onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
            fullWidth
            required
          />
          
          <TextField
            label="Total Amount"
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
            fullWidth
            required
          />
          
          <FormControl fullWidth required>
            <InputLabel>Payment Type</InputLabel>
            <Select
              value={paymentType}
              onChange={(e) => handlePaymentTypeChange(e.target.value)}
              label="Payment Type"
            >
              <MenuItem value="">
                <em>Select a payment type</em>
              </MenuItem>
              {paymentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Cascading Field Selector */}
          {paymentType && (
            <CascadingFieldSelector
              directoryId="payment-types-directory"
              fieldId="payment_type"
              initialValue={paymentType}
              onSelectionChange={handleCascadingSelectionChange}
              label="Additional Details"
            />
          )}
          
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ mt: 2 }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Submit Receipt'}
          </Button>
        </Box>
        
        {/* Display current selections */}
        {cascadingSelections.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Selections:
            </Typography>
            {cascadingSelections.map((selection, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                <strong>{selection.fieldName}:</strong> {selection.displayName} ({selection.value})
              </Alert>
            ))}
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CascadingTest; 