import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import RelationField from './RelationField';

const RelationFieldTest: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [cascadingSelections, setCascadingSelections] = useState<any[]>([]);

  const handleChange = (value: string, cascading?: any[]) => {
    console.log('Selected value:', value);
    console.log('Cascading selections:', cascading);
    setSelectedValue(value);
    setCascadingSelections(cascading || []);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        RelationField Search Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        This component tests the searchable RelationField with debounced search functionality.
        Try typing in the field to see the search in action.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <RelationField
          relationDirectoryId="1" // Replace with actual directory ID
          companyId="1" // Replace with actual company ID
          value={selectedValue}
          onChange={handleChange}
          label="Test Relation Field"
          showCascading={false}
        />
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6">Selected Value:</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {selectedValue || 'None'}
        </Typography>
        
        {cascadingSelections.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>Cascading Selections:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {JSON.stringify(cascadingSelections, null, 2)}
            </Typography>
          </>
        )}
      </Box>

      <Button 
        variant="outlined" 
        onClick={() => {
          setSelectedValue('');
          setCascadingSelections([]);
        }}
        sx={{ mt: 2 }}
      >
        Clear Selection
      </Button>
    </Box>
  );
};

export default RelationFieldTest; 