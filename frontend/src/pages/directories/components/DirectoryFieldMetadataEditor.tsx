import React from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import KeyValueEditor, { KeyValueObject } from '@/components/KeyValueEditor';
import { DirectoryField } from '@/api/services/directories';

interface DirectoryFieldMetadataEditorProps {
  open: boolean;
  onClose: () => void;
  field: DirectoryField;
  onSave: (metadata: KeyValueObject) => void;
}

const DirectoryFieldMetadataEditor: React.FC<DirectoryFieldMetadataEditorProps> = ({
  open,
  onClose,
  field,
  onSave,
}) => {
  const { t } = useTranslation();
  const [metadata, setMetadata] = React.useState<KeyValueObject>(field.metadata || {});

  React.useEffect(() => {
    setMetadata(field.metadata || {});
  }, [field]);

  const handleSave = () => {
    onSave(metadata);
    onClose();
  };

  const handleCancel = () => {
    setMetadata(field.metadata || {});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>
            {t('directories.editFieldMetadata', 'Edit Field Metadata')}
          </Typography>
          <IconButton onClick={handleCancel} size="small">
            <Icon icon="ph:x" width={20} />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('directories.fieldMetadataDescription', 'Configure metadata for field:')} <strong>{field.name}</strong>
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('directories.fieldMetadataHelp', 'Common metadata keys include: fieldOrder, isVisibleOnTable, isRequired, validationRules, etc.')}
          </Typography>
        </Box>
        
        <KeyValueEditor
          label={t('directories.metadata', 'Metadata')}
          value={metadata}
          onChange={setMetadata}
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleCancel} variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#3b82f6' }}>
          {t('common.saveChanges', 'Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DirectoryFieldMetadataEditor; 