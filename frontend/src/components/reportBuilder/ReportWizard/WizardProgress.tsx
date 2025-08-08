import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WizardStep, WizardStepValidation } from '../../../types/wizard';

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
  const { t } = useTranslation();
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
      className="w-full mb-5"
      aria-label={t('wizard.progressNavigation', 'Progress Navigation')}
      ref={containerRef}
      tabIndex={0}
      role="navigation"
    >
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-5" aria-hidden="true">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex justify-between items-center mb-5 text-sm text-gray-500">
        <span>{t('wizard.stepOf', 'Step {{current}} of {{total}}', { current: currentStep + 1, total: steps.length })}</span>
        <span>{t('wizard.estimatedTime', 'Estimated time: {{minutes}} minutes', { minutes: estTime })}</span>
      </div>
      <ol className="flex gap-5 overflow-x-auto list-none p-0 m-0" aria-label={t('wizard.breadcrumb', 'Wizard Steps')}>
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
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 min-w-[200px] flex-shrink-0
                ${status === 'completed' ? 'bg-blue-50 border border-blue-200' : ''}
                ${status === 'current' ? 'bg-blue-100 border-2 border-blue-600' : ''}
                ${status === 'pending' ? 'bg-gray-50 border border-gray-200 opacity-60' : ''}
                ${status === 'error' ? 'bg-red-50 border border-red-200' : ''}
                ${clickable ? 'hover:-translate-y-0.5 hover:shadow-lg' : ''}
              `}
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
                  ? t('wizard.stepCompleted', 'Step completed: {{step}}', { step: step.title })
                  : status === 'error'
                  ? t('wizard.stepError', 'Step error: {{step}}', { step: step.title })
                  : status === 'current'
                  ? t('wizard.currentStep', 'Current step: {{step}}', { step: step.title })
                  : t('wizard.stepPending', 'Step pending: {{step}}', { step: step.title })
              }
            >
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm
                ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                ${status === 'current' ? 'bg-blue-600 text-white' : ''}
                ${status === 'pending' ? 'bg-gray-400 text-white' : ''}
                ${status === 'error' ? 'bg-red-500 text-white' : ''}
              `}>
                {status === 'completed' ? (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : status === 'error' ? (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-700 mb-1">{step.title}</div>
                {step.isOptional && <div className="text-xs text-gray-500 italic">{t('wizard.optional', 'Optional')}</div>}
                {errorMsg && status === 'error' && (
                  <div className="text-xs text-red-500 mt-1" role="alert">{errorMsg}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}; 