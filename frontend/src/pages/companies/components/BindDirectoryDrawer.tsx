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
  ListItemButton,
  TextField,
  InputAdornment,
  Divider,
  Chip
} from '@mui/material';
import { Icon } from '@iconify/react';
import type { Module as BaseModule } from '@/api/services/modules';
import { useTranslation } from 'react-i18next';
import AddDirectoryDrawer from '@/pages/directories/components/AddDirectoryDrawer';

interface Directory {
  id: string;
  name: string;
  icon_name?: string;
  directory_type: string;
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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDirectoryOpen, setIsAddDirectoryOpen] = useState(false);

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

  // Filter directories based on search query
  const filteredDirectories = useMemo(() => {
    if (!searchQuery.trim()) {
      return uniqueAllDirectories;
    }
    return uniqueAllDirectories.filter(directory =>
      directory.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueAllDirectories, searchQuery]);

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

  const handleAddDirectory = () => {
    setIsAddDirectoryOpen(true);
  };

  const handleAddDirectoryClose = () => {
    setIsAddDirectoryOpen(false);
  };

  const getDirectoryTypeColor = (type: string) => {
    switch (type) {
      case 'Module':
        return 'primary';
      case 'Company':
        return 'success';
      case 'System':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 450 } }}>
        <Box p={3} display="flex" flexDirection="column" height="100%">
          <Typography variant="h6" mb={2}>
            {t('companies.bindDirectoryTo', { module: module?.name })}
          </Typography>
          
          {/* Search and Add Directory Section */}
          <Box mb={2}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('common.search', 'Search directories...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:magnify" width={20} height={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              startIcon={<Icon icon="mdi:plus" />}
              onClick={handleAddDirectory}
              fullWidth
              size="small"
            >
              {t('companies.addDirectory', 'Add Directory')}
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Directories List */}
          <Box flex={1} overflow="auto">
            <List>
              {filteredDirectories.map(directory => (
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
                  <ListItemText 
                    primary={directory.name}
                    secondary={
                      <Chip
                        label={directory.directory_type}
                        size="small"
                        color={getDirectoryTypeColor(directory.directory_type)}
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    }
                  />
                </ListItemButton>
              ))}
              {filteredDirectories.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary={
                      searchQuery.trim() 
                        ? t('companies.noDirectoriesFound', 'No directories found matching your search.') 
                        : t('companies.noDirectoriesToBind', 'No directories available to bind.')
                    } 
                  />
                </ListItem>
              )}
            </List>
          </Box>

          {/* Action Buttons */}
          <Box mt={2} display="flex" gap={2}>
            <Button variant="outlined" onClick={onClose} fullWidth>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleBind}
              disabled={selected.length === 0}
              fullWidth
            >
              {t('companies.bindSelected', 'Bind Selected')} ({selected.length})
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Add Directory Drawer */}
      <AddDirectoryDrawer
        open={isAddDirectoryOpen}
        onClose={handleAddDirectoryClose}
      />
    </>
  );
};

export default BindDirectoryDrawer;
