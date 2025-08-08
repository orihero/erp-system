import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { Company } from '@/api/services/companies';
import type { Directory } from '@/api/services/directories';
import SelectDirectoryStep from './SelectDirectoryStep';
import PreviewStep from './PreviewStep';
import DataFilteringStep from './DataFilteringStep';

interface InsertWizardProps {
  open: boolean;
  onClose: () => void;
  insertType: string;
  company: Company;
  fullScreen?: boolean;
  onComplete?: (data: {
    type: string;
    directory?: any;
    filters?: string[];
    sorting?: string[];
    grouping?: string[];
    joins?: string[];
  }) => void;
}

const InsertWizard: React.FC<InsertWizardProps> = ({
  open,
  onClose,
  insertType,
  company,
  fullScreen = false,
  onComplete
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDirectory, setSelectedDirectory] = useState<Directory | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSorting, setSelectedSorting] = useState<string[]>([]);
  const [selectedGrouping, setSelectedGrouping] = useState<string[]>([]);
  const [selectedJoins, setSelectedJoins] = useState<string[]>([]);

  const steps = [
    t('wizard.selectDirectory', 'Select Directory'),
    t('wizard.dataFiltering', 'Data Filtering'),
    t('wizard.preview', 'Preview')
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleClose = () => {
    console.log('InsertWizard handleClose called:', { 
      activeStep, 
      stepsLength: steps.length, 
      selectedDirectory, 
      onComplete: !!onComplete 
    });
    
    // If we're on the last step and have a directory selected, complete the insertion
    if (activeStep === steps.length - 1 && selectedDirectory && onComplete) {
      const completionData = {
        type: insertType,
        directory: selectedDirectory,
        filters: selectedFilters,
        sorting: selectedSorting,
        grouping: selectedGrouping,
        joins: selectedJoins,
      };
      console.log('Calling onComplete with data:', completionData);
      onComplete(completionData);
    }
    
    setActiveStep(0);
    setSelectedDirectory(null);
    setSelectedFilters([]);
    setSelectedSorting([]);
    setSelectedGrouping([]);
    setSelectedJoins([]);
    onClose();
  };

  const handleDirectorySelect = (directory: Directory) => {
    setSelectedDirectory(directory);
  };

  const getInsertTypeIcon = () => {
    switch (insertType) {
      case 'text':
        return 'mdi:format-text';
      case 'table':
        return 'mdi:table';
      case 'chart':
        return 'mdi:chart-line';
      default:
        return 'mdi:plus';
    }
  };

  const getInsertTypeTitle = () => {
    switch (insertType) {
      case 'text':
        return t('reports.insertText', 'Text');
      case 'table':
        return t('reports.insertTable', 'Table');
      case 'chart':
        return t('reports.insertChart', 'Chart');
      default:
        return t('reports.insert', 'Insert');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <SelectDirectoryStep
            companyId={company.id}
            selectedDirectory={selectedDirectory}
            onDirectorySelect={handleDirectorySelect}
          />
        );

      case 1:
        return selectedDirectory ? (
          <DataFilteringStep
            selectedDirectory={selectedDirectory}
            companyId={company.id}
            selectedFilters={selectedFilters}
            selectedSorting={selectedSorting}
            selectedGrouping={selectedGrouping}
            selectedJoins={selectedJoins}
            onFiltersChange={setSelectedFilters}
            onSortingChange={setSelectedSorting}
            onGroupingChange={setSelectedGrouping}
            onJoinsChange={setSelectedJoins}
          />
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">
              {t('wizard.noDirectorySelected', 'No directory selected')}
            </Typography>
          </Box>
        );

      case 2:
        return selectedDirectory ? (
          <PreviewStep
            insertType={insertType}
            selectedDirectory={selectedDirectory}
            selectedFilters={selectedFilters}
            selectedSorting={selectedSorting}
            selectedGrouping={selectedGrouping}
            selectedJoins={selectedJoins}
            companyId={company.id}
          />
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">
              {t('wizard.noDirectorySelected', 'No directory selected')}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={fullScreen ? false : "md"}
      fullWidth={!fullScreen}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          minHeight: fullScreen ? '100vh' : '600px',
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon
            icon={getInsertTypeIcon()}
            style={{ fontSize: '24px', color: '#3b82f6' }}
          />
          <Typography variant="h6">
            {t('wizard.insertTitle', 'Insert {{insertType}}', { insertType: getInsertTypeTitle() })}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 3 }} />

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          {t('common.back', 'Back')}
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleClose : handleNext}
          disabled={
            (activeStep === 0 && !selectedDirectory) ||
            (activeStep === 1 && !selectedDirectory)
          }
        >
          {activeStep === steps.length - 1
            ? t('common.finish', 'Finish')
            : t('common.next', 'Next')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InsertWizard; 