import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Icon } from '@iconify/react';
import RoleManagementDrawer from './RoleManagementDrawer';

const Roles: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Role Management
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setDrawerOpen(true)}
          sx={{ 
            borderRadius: 999, 
            textTransform: 'none', 
            bgcolor: '#3b82f6',
            px: 3,
            py: 1.5
          }}
        >
          <Icon icon="ph:plus" style={{ marginRight: 8 }} />
          Manage Roles
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          User Roles & Permissions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage user roles and their associated permissions. Roles define what actions users can perform within the system.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 3, borderRadius: 2, minWidth: 200, bgcolor: '#f8fafc' }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Icon icon="solar:users-group-two-rounded-linear" style={{ marginRight: 8 }} />
              Roles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage user roles with specific permissions
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 3, borderRadius: 2, minWidth: 200, bgcolor: '#f8fafc' }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Icon icon="solar:shield-keyhole-linear" style={{ marginRight: 8 }} />
              Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define granular permissions for different system actions
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 3, borderRadius: 2, minWidth: 200, bgcolor: '#f8fafc' }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Icon icon="solar:user-id-linear" style={{ marginRight: 8 }} />
              Assignments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assign roles to users and manage role-permission relationships
            </Typography>
          </Paper>
        </Box>
      </Paper>

      <RoleManagementDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </Box>
  );
};

export default Roles; 