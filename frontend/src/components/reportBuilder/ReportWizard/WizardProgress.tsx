import React, { useRef, useEffect } from 'react';
import { WizardStep, WizardStepValidation } from '../../../types/wizard';
import './WizardProgress.scss';

// Placeholder translation function
declare function t(key: string, params?: Record<string, unknown>): string;

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  stepValidation: Record<number, WizardStepValidation>;
  onStepClick: (stepIndex: number) => void;
  estimatedMinutes?: number;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  steps,
  currentStep,
  stepValidation,
  onStepClick,
  estimatedMinutes = 5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current || !containerRef.current.contains(document.activeElement)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(currentStep + 1, steps.length - 1);
        if (isStepClickable(next)) onStepClick(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(currentStep - 1, 0);
        if (isStepClickable(prev)) onStepClick(prev);
      } else if (e.key === 'Home') {
        e.preventDefault();
        if (isStepClickable(0)) onStepClick(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        if (isStepClickable(steps.length - 1)) onStepClick(steps.length - 1);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, steps]);

  // Step status logic
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      const validation = stepValidation[stepIndex];
      return validation?.isValid ? 'completed' : 'error';
    } else if (stepIndex === currentStep) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  // Only allow navigation to completed or current steps (breadcrumb)
  const isStepClickable = (stepIndex: number) => {
    if (stepIndex < currentStep) return true;
    if (stepIndex === currentStep) return false;
    // Prevent forward navigation if current step is invalid
    if (stepIndex > currentStep) {
      for (let i = currentStep; i < stepIndex; i++) {
        if (!stepValidation[i]?.isValid && !steps[i].isOptional) return false;
      }
    }
    return true;
  };

  // Progress bar percentage
  const progressPercent = ((currentStep) / (steps.length - 1)) * 100;

  // Estimated time left
  const stepsLeft = steps.length - currentStep - 1;
  const estTime = Math.round((stepsLeft / steps.length) * estimatedMinutes);

  return (
    <nav
      className="wizard-progress"
      aria-label={t('wizard.progressNavigation')}
      ref={containerRef}
      tabIndex={0}
      role="navigation"
    >
      <div className="progress-bar" aria-hidden="true">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="progress-meta flex justify-between items-center mb-2">
        <span>{t('wizard.stepOf', { current: currentStep + 1, total: steps.length })}</span>
        <span>{t('wizard.estimatedTime', { minutes: estTime })}</span>
      </div>
      <ol className="steps-container" aria-label={t('wizard.breadcrumb')}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const clickable = isStepClickable(index);
          const validation = stepValidation[index];
          const errorMsg = validation?.errors?.length
            ? validation.errors.map(e => t(e.message)).join(', ')
            : undefined;
          return (
            <li
              key={step.id}
              className={`step-item ${status} ${clickable ? 'clickable' : ''}`}
              aria-current={status === 'current' ? 'step' : undefined}
              aria-disabled={!clickable}
              tabIndex={clickable ? 0 : -1}
              onClick={() => clickable && onStepClick(index)}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ' ') && clickable) onStepClick(index);
              }}
              role="listitem"
              aria-label={
                status === 'completed'
                  ? t('wizard.stepCompleted', { step: step.title })
                  : status === 'error'
                  ? t('wizard.stepError', { step: step.title })
                  : status === 'current'
                  ? t('wizard.currentStep', { step: step.title })
                  : t('wizard.stepPending', { step: step.title })
              }
            >
              <div className="step-indicator">
                <div className="step-number">
                  {status === 'completed' ? (
                    <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : status === 'error' ? (
                    <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
              <div className="step-content">
                <div className="step-title">{step.title}</div>
                {step.isOptional && <div className="step-optional">{t('wizard.optional')}</div>}
                {errorMsg && status === 'error' && (
                  <div className="step-error" role="alert">{errorMsg}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}; 