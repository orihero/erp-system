import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions 
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Company } from '@/api/services/companies';
import { excelReportTemplateAPI, type ExcelReportTemplate } from '@/api/services/excelReportTemplates';
import { PeriodAndDirectoryStep } from './steps/PeriodAndDirectoryStep';
import { ModuleSelectionStep } from './steps/ModuleSelectionStep';
import { DownloadAndUploadStep } from './steps/DownloadAndUploadStep';

interface ExcelReportWizardProps {
  company: Company;
  open: boolean;
  onComplete?: (reportData: ExcelReportData) => void;
  onCancel?: () => void;
  editingTemplate?: ExcelReportTemplate;
}

export interface ExcelReportData {
  companyId: string;
  startDate: string;
  endDate: string;
  selectedDirectories: string[];
  selectedModules: string[];
  reportName: string;
}

const steps = [
  'periodAndDirectorySelection',
  'moduleSelection',
  'downloadAndUpload'
];

export const ExcelReportWizard: React.FC<ExcelReportWizardProps> = ({
  company,
  open,
  onComplete,
  onCancel,
  editingTemplate
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [reportData, setReportData] = useState<ExcelReportData>({
    companyId: company.id,
    startDate: editingTemplate?.start_date || '',
    endDate: editingTemplate?.end_date || '',
    selectedDirectories: editingTemplate?.selected_directories || [],
    selectedModules: editingTemplate?.selected_modules || [],
    reportName: editingTemplate?.name || `${company.name} Report - ${new Date().toLocaleDateString()}`
  });
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { allDirectories, loading } = useSelector((state: RootState) => state.companyDirectories);

  const handleNext = useCallback(async () => {
    if (activeStep === 0) {
      // Move to module selection step
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Create or update Excel report template when moving from step 1 to step 2
      setSaving(true);
      try {
        const templateData = {
          companyId: reportData.companyId,
          name: reportData.reportName,
          startDate: reportData.startDate,
          endDate: reportData.endDate,
          selectedDirectories: reportData.selectedDirectories,
          selectedModules: reportData.selectedModules
        };

        let templateId: string;
        if (editingTemplate) {
          // Update existing template
          const response = await excelReportTemplateAPI.updateTemplate(editingTemplate.id, templateData);
          templateId = response.data.data.id;
        } else {
          // Create new template
          const response = await excelReportTemplateAPI.createTemplate(templateData);
          templateId = response.data.data.id;
        }
        
        setSavedTemplateId(templateId);
        setActiveStep(2);
      } catch (error) {
        console.error('Error saving template:', error);
        // You might want to show an error message to the user here
      } finally {
        setSaving(false);
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  }, [activeStep, reportData, editingTemplate]);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => prevStep - 1);
  }, []);

  const handleStepDataChange = useCallback((stepData: Partial<ExcelReportData>) => {
    setReportData(prev => ({ ...prev, ...stepData }));
  }, []);

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete(reportData);
    }
  }, [reportData, onComplete]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Period and Directory Selection
        return !!(reportData.startDate && reportData.endDate && reportData.selectedDirectories.length > 0);
      case 1: // Module Selection
        return !!(reportData.selectedModules.length > 0);
      case 2: // Download and Upload
        return !!(reportData.reportName && savedTemplateId);
      default:
        return false;
    }
  };

  const canProceed = isStepValid(activeStep);
  const isLastStep = activeStep === steps.length - 1;

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <PeriodAndDirectoryStep
            data={reportData}
            directories={allDirectories.filter(dir => dir.is_enabled)}
            loading={loading}
            onDataChange={handleStepDataChange}
          />
        );
      case 1:
        return (
          <ModuleSelectionStep
            data={reportData}
            companyId={company.id}
            onDataChange={handleStepDataChange}
          />
        );
      case 2:
        return (
          <DownloadAndUploadStep
            data={reportData}
            company={company}
            directories={allDirectories.filter(dir => 
              dir.is_enabled && reportData.selectedDirectories.includes(dir.id)
            )}
            templateId={savedTemplateId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa',
        pb: 2
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
            {editingTemplate 
              ? t('reports.editExcelReport', 'Edit Excel Report') 
              : t('reports.createExcelReport', 'Create Excel Report')
            }
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                {t(`reports.wizard.${label}`, label.replace(/([A-Z])/g, ' $1').trim())}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{
          padding: '30px',
          minHeight: '500px'
        }}>
          {renderStepContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        justifyContent: 'space-between'
      }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<Icon icon="mdi:arrow-left" />}
        >
          {t('common.previous', 'Previous')}
        </Button>

        <Button
          variant="contained"
          onClick={isLastStep ? handleComplete : handleNext}
          disabled={!canProceed || saving}
          endIcon={isLastStep ? <Icon icon="mdi:file-excel" /> : <Icon icon="mdi:content-save" />}
          sx={{
            bgcolor: '#3b82f6',
            '&:hover': {
              bgcolor: '#2563eb',
            },
          }}
        >
          {saving 
            ? t('reports.wizard.saving', 'Saving...')
            : isLastStep 
              ? t('reports.generateReport', 'Generate Report') 
              : editingTemplate
                ? t('reports.wizard.updateAndContinue', 'Update and Continue')
                : t('reports.wizard.saveAndContinue', 'Save and Continue')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};
