import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  ListItemButton
} from '@mui/material';
import { Icon } from '@iconify/react';
import type { Module as BaseModule } from '@/api/services/modules';

interface Directory {
  id: string;
  name: string;
  icon_name?: string;
}

interface BindDirectoryDrawerProps {
  open: boolean;
  onClose: () => void;
  module: BaseModule | null;
  boundDirectories: Directory[];
  allDirectories: Directory[];
  onBind: (directoryIds: string[]) => void;
}

const BindDirectoryDrawer: React.FC<BindDirectoryDrawerProps> = ({
  open,
  onClose,
  module,
  boundDirectories,
  allDirectories,
  onBind
}) => {
  // Deduplicate allDirectories by id
  const uniqueAllDirectories = useMemo(() => {
    const map = new Map<string, Directory>();
    allDirectories.forEach(dir => {
      if (!map.has(dir.id)) {
        map.set(dir.id, dir);
      }
    });
    return Array.from(map.values());
  }, [allDirectories]);

  // Debug logs
  console.log('[BindDirectoryDrawer] allDirectories:', allDirectories);
  console.log('[BindDirectoryDrawer] uniqueAllDirectories:', uniqueAllDirectories);

  const [selected, setSelected] = useState<string[]>(boundDirectories.map(d => d.id));

  const handleToggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBind = () => {
    onBind(selected);
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 400 } }}>
      <Box p={3} display="flex" flexDirection="column" height="100%">
        <Typography variant="h6" mb={2}>
          Bind Directory to {module?.name}
        </Typography>
        <List>
          {uniqueAllDirectories.map(directory => (
            <ListItemButton key={directory.id} onClick={() => handleToggle(directory.id)}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selected.includes(directory.id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemIcon>
                <Icon icon={directory.icon_name || 'mdi:folder'} width={20} height={20} />
              </ListItemIcon>
              <ListItemText primary={directory.name} />
            </ListItemButton>
          ))}
          {uniqueAllDirectories.length === 0 && (
            <ListItem>
              <ListItemText primary="No directories available to bind." />
            </ListItem>
          )}
        </List>
        <Box mt="auto" display="flex" gap={2}>
          <Button variant="outlined" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBind}
            disabled={selected.length === 0}
            fullWidth
          >
            Bind Selected
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default BindDirectoryDrawer;
