import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// TODO: Update these imports when actual component locations are known
import { WizardProgress } from '../WizardProgress';
import { WizardStep } from '../WizardStep';
import { useReportWizard } from '../hooks/useReportWizard';
// import { useTemplateValidation } from '../hooks/useTemplateValidation'; // Not used in code
import { ReportTemplate } from '../../../types/reportTemplate';
// TODO: Update these imports when actual component locations are known
import { Button } from '../../common/Button/Button';
import { Modal } from '../../common/Modal/Modal';
import './ReportWizard.scss';

interface ReportWizardProps {
  onComplete?: (template: ReportTemplate) => void;
  onCancel?: () => void;
}

export const ReportWizard: React.FC<ReportWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();
  
  const {
    currentStep,
    wizardData,
    isLoading,
    error,
    steps,
    validation,
    goToStep,
    nextStep,
    previousStep,
    updateStepData,
    submitTemplate,
    loadTemplate,
    validateStep,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastSaved
  } = useReportWizard(templateId);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAutoSaveSettings, setShowAutoSaveSettings] = useState(false);
  
  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId, loadTemplate]);
  
  const handleStepDataChange = useCallback(async (stepId: string, data: unknown) => {
    updateStepData(stepId, data);
    
    // Validate step data in background
    try {
      await validateStep(stepId, data);
    } catch (error) {
      console.warn(`Step ${stepId} validation failed:`, error);
    }
  }, [updateStepData, validateStep]);
  
  const handleNext = useCallback(async () => {
    const currentStepData = steps[currentStep];
    const stepData = wizardData[currentStepData.id];
    
    // Validate current step before proceeding
    try {
      const stepValidation = await validateStep(currentStepData.id, stepData);
      
      if (stepValidation.isValid || currentStepData.isOptional) {
        nextStep();
      } else {
        console.error('Step validation failed:', stepValidation.errors);
        // Show validation errors to user
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  }, [currentStep, steps, wizardData, validateStep, nextStep]);
  
  const handlePrevious = useCallback(() => {
    previousStep();
  }, [previousStep]);
  
  const handleStepClick = useCallback((stepIndex: number) => {
    // Allow navigation to completed steps or current step
    const targetStep = steps[stepIndex];
    const stepValidation = validation[stepIndex];
    
    if (stepIndex <= currentStep || stepValidation?.isValid || targetStep.isOptional) {
      goToStep(stepIndex);
    }
  }, [currentStep, validation, steps, goToStep]);
  
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      const template = await submitTemplate();
      
      if (onComplete) {
        onComplete(template);
      } else {
        navigate('/report-templates');
      }
    } catch (error) {
      console.error('Failed to submit template:', error);
      // Show error to user
    } finally {
      setIsSubmitting(false);
    }
  }, [submitTemplate, onComplete, navigate]);
  
  const handleCancel = useCallback(() => {
    const hasUnsavedChanges = Object.keys(wizardData).length > 0;
    
    if (hasUnsavedChanges) {
      setShowCancelModal(true);
    } else {
      if (onCancel) {
        onCancel();
      } else {
        navigate('/report-templates');
      }
    }
  }, [wizardData, onCancel, navigate]);
  
  const confirmCancel = useCallback(() => {
    setShowCancelModal(false);
    if (onCancel) {
      onCancel();
    } else {
      navigate('/report-templates');
    }
  }, [onCancel, navigate]);
  
  if (isLoading) {
    return (
      <div className="report-wizard__loading">
        <div className="loading-spinner" />
        <p>Loading template...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="report-wizard__error">
        <h3>Error Loading Template</h3>
        <p>{error}</p>
        <Button onClick={() => navigate('/report-templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }
  
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = validation[currentStep]?.isValid || currentStepData.isOptional;
  
  return (
    <div className="report-wizard">
      <div className="report-wizard__header">
        <div className="header-content">
          <h1>
            {templateId ? 'Edit Report Template' : 'Create Report Template'}
          </h1>
          
          <div className="header-actions">
            {autoSaveEnabled && lastSaved && (
              <span className="auto-save-status">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAutoSaveSettings(true)}
            >
              Settings
            </Button>
          </div>
        </div>
        
        <WizardProgress
          steps={steps}
          currentStep={currentStep}
          stepValidation={validation}
          onStepClick={handleStepClick}
        />
      </div>
      
      <div className="report-wizard__content">
        <div className="step-header">
          <h2>{currentStepData.title}</h2>
          <p>{currentStepData.description}</p>
        </div>
        
        <div className="step-content">
          <WizardStep
            step={currentStepData}
            data={wizardData[currentStepData.id]}
            wizardData={wizardData}
            validation={validation[currentStep]}
            onDataChange={(data) => handleStepDataChange(currentStepData.id, data)}
          />
        </div>
      </div>
      
      <div className="report-wizard__footer">
        <div className="wizard-actions">
          <Button
            variant="secondary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          
          <div className="navigation-buttons">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {isLastStep ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                loading={isSubmitting}
              >
                {templateId ? 'Update Template' : 'Create Template'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {showCancelModal && (
        <Modal
          title="Confirm Cancel"
          onClose={() => setShowCancelModal(false)}
        >
          <p>You have unsaved changes. Are you sure you want to cancel?</p>
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
            >
              Continue Editing
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancel}
            >
              Discard Changes
            </Button>
          </div>
        </Modal>
      )}
      
      {showAutoSaveSettings && (
        <Modal
          title="Auto-Save Settings"
          onClose={() => setShowAutoSaveSettings(false)}
        >
          <div className="auto-save-settings">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              />
              Enable auto-save
            </label>
            <p className="help-text">
              Automatically save your progress every 30 seconds
            </p>
          </div>
          <div className="modal-actions">
            <Button onClick={() => setShowAutoSaveSettings(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}; 