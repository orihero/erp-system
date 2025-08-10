import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// TODO: Update these imports when actual component locations are known
import { WizardProgress } from "./WizardProgress";
import { WizardStep } from "./WizardStep";
import { useReportWizard } from '../hooks/useReportWizard';
// import { useTemplateValidation } from '../hooks/useTemplateValidation'; // Not used in code
import { ReportTemplate } from '../../../types/reportTemplate';
import { WizardStepData } from '../../../types/wizard';
// TODO: Update these imports when actual component locations are known
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ReportWizardProps {
  onComplete?: (template: ReportTemplate) => void;
  onCancel?: () => void;
  templateId?: string;
}

export const ReportWizard: React.FC<ReportWizardProps> = ({
  onComplete,
  onCancel,
  templateId: propTemplateId,
}) => {
  const navigate = useNavigate();
  const { templateId: routeTemplateId } = useParams<{ templateId?: string }>();
  const templateId = propTemplateId || routeTemplateId;
  
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
    updateStepData(stepId, data as WizardStepData);
    
    // Validate step data in background
    try {
      await validateStep(stepId, data as WizardStepData);
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
        navigate('/reports');
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
        navigate('/reports');
      }
    }
  }, [wizardData, onCancel, navigate]);
  
  const confirmCancel = useCallback(() => {
    setShowCancelModal(false);
    if (onCancel) {
      onCancel();
    } else {
      navigate('/reports');
    }
  }, [onCancel, navigate]);
  
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '20px', fontSize: '16px' }}>Loading template...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <h3 style={{ color: '#d32f2f', marginBottom: '20px' }}>Error Loading Template</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
        <Button onClick={() => navigate('/reports')}>
          Back to Reports
        </Button>
      </div>
    );
  }
  
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = validation[currentStep]?.isValid || currentStepData.isOptional;
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#333'
          }}>
            {templateId ? 'Edit Report Template' : 'Create Report Template'}
          </h1>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            {autoSaveEnabled && lastSaved && (
              <span style={{
                fontSize: '14px',
                color: '#666'
              }}>
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
      
      {/* Content */}
      <div style={{
        flex: 1,
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: '500px'
        }}>
          <div style={{
            marginBottom: '30px'
          }}>
            <h2 style={{
              margin: '0 0 10px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#333'
            }}>
              {currentStepData.title}
            </h2>
            <p style={{
              margin: 0,
              color: '#666',
              fontSize: '16px'
            }}>
              {currentStepData.description}
            </p>
          </div>
          
          <div>
            <WizardStep
              step={currentStepData}
              data={wizardData[currentStepData.id]}
              wizardData={wizardData}
              validation={validation[currentStep]}
              onDataChange={(data) => handleStepDataChange(currentStepData.id, data)}
            />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        backgroundColor: '#fff',
        borderTop: '1px solid #e0e0e0',
        padding: '20px',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Button
            variant="secondary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          
          <div style={{
            display: 'flex',
            gap: '15px'
          }}>
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