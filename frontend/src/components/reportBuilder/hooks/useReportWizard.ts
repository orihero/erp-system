import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardStep, WizardStepData, WizardState, WizardStepValidation, WizardStepProps } from '../../../types/wizard';
import { ReportTemplate } from '../../../types/reportTemplate';
import { reportTemplateAPI } from '../../../services/api/reportTemplates';
import { BasicInfoStep } from '../steps/BasicInfo/BasicInfoStep';
import { DataSourceStep } from '../steps/DataSourceStep';
import { FieldConfigStep } from '../steps/FieldConfigStep';
import { LayoutStep } from '../steps/LayoutStep';
import { StylingStep } from '../steps/StylingStep';
import { ParametersStep } from '../steps/ParametersStep';
import { BindingStep } from '../steps/BindingStep';
import { ReviewStep } from '../steps/ReviewStep';

const LOCAL_STORAGE_KEY = 'report-wizard-state';

// Add version and audit trail types
interface WizardAuditEntry {
  timestamp: number;
  action: string;
  state: WizardState;
}
interface PersistedWizard {
  version: number;
  state: WizardState;
  audit: WizardAuditEntry[];
}
const PERSIST_VERSION = 1;
const MAX_AUDIT_ENTRIES = 10;

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Provide basic details about your report template',
    component: BasicInfoStep,
  },
  {
    id: 'data-source',
    title: 'Data Source',
    description: 'Configure the data source and query for your report',
    component: DataSourceStep,
  },
  {
    id: 'field-config',
    title: 'Field Configuration',
    description: 'Select and configure the fields to include in your report',
    component: FieldConfigStep,
    shouldSkip: (data) => !data['data-source']?.dataSourceId,
  },
  {
    id: 'layout',
    title: 'Layout & Grouping',
    description: 'Define the layout and grouping structure of your report',
    component: LayoutStep,
  },
  {
    id: 'styling',
    title: 'Styling & Formatting',
    description: 'Customize the visual appearance of your report',
    component: StylingStep,
    isOptional: true,
  },
  {
    id: 'parameters',
    title: 'Parameters',
    description: 'Define dynamic parameters for your report',
    component: ParametersStep,
    isOptional: true,
  },
  {
    id: 'binding',
    title: 'Company & Module Binding',
    description: 'Specify which companies and modules can access this template',
    component: BindingStep,
  },
  {
    id: 'review',
    title: 'Review & Save',
    description: 'Review your template configuration and save',
    component: ReviewStep,
  },
];

function getPersistedState(templateId?: string): WizardState | null {
  try {
    const key = `${LOCAL_STORAGE_KEY}${templateId ? '-' + templateId : ''}`;
    // Try localStorage, then sessionStorage
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.state) return null;
    return parsed.state;
  } catch {
    return null;
  }
}

function persistState(state: WizardState, templateId?: string, action: string = 'auto-save') {
  try {
    const key = `${LOCAL_STORAGE_KEY}${templateId ? '-' + templateId : ''}`;
    let persisted: PersistedWizard = {
      version: PERSIST_VERSION,
      state,
      audit: [],
    };
    const prevRaw = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (prevRaw) {
      try {
        const prev = JSON.parse(prevRaw);
        if (prev && prev.audit) persisted.audit = prev.audit;
      } catch {}
    }
    // Add audit entry
    persisted.audit.push({ timestamp: Date.now(), action, state });
    if (persisted.audit.length > MAX_AUDIT_ENTRIES) persisted.audit = persisted.audit.slice(-MAX_AUDIT_ENTRIES);
    const str = JSON.stringify(persisted);
    localStorage.setItem(key, str);
    sessionStorage.setItem(key, str);
  } catch {
    // Handle quota exceeded, etc.
    // Optionally notify user
  }
}

function clearPersistedState(templateId?: string) {
  try {
    const key = `${LOCAL_STORAGE_KEY}${templateId ? '-' + templateId : ''}`;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch {}
}

// Export/import for backup/migration
function exportWizardState(templateId?: string): string | null {
  try {
    const key = `${LOCAL_STORAGE_KEY}${templateId ? '-' + templateId : ''}`;
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function importWizardState(data: string, templateId?: string) {
  try {
    const key = `${LOCAL_STORAGE_KEY}${templateId ? '-' + templateId : ''}`;
    localStorage.setItem(key, data);
    sessionStorage.setItem(key, data);
  } catch {}
}

export const useReportWizard = (templateId?: string) => {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [rollbackState, setRollbackState] = useState<WizardState | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  // Add error state for persistence
  const [persistError, setPersistError] = useState<string | null>(null);

  // Rehydrate state from localStorage or initialize
  const [state, setState] = useState<WizardState>(() => {
    const persisted = getPersistedState(templateId);
    return (
      persisted || {
        currentStep: 0,
        steps: WIZARD_STEPS,
        data: {},
        validation: {},
        isLoading: false,
        error: undefined,
      }
    );
  });

  // Persist state on every change
  useEffect(() => {
    try {
      persistState(state, templateId);
      setPersistError(null);
    } catch {
      setPersistError('Failed to save wizard state. Please check your storage quota.');
    }
  }, [state, templateId]);

  // Navigation helpers with branching logic
  const getNextStepIndex = (from: number, data: Record<string, WizardStepData>) => {
    let idx = from + 1;
    while (idx < state.steps.length && state.steps[idx].shouldSkip?.(data)) {
      idx++;
    }
    return Math.min(idx, state.steps.length - 1);
  };
  const getPrevStepIndex = (from: number, data: Record<string, WizardStepData>) => {
    let idx = from - 1;
    while (idx >= 0 && state.steps[idx].shouldSkip?.(data)) {
      idx--;
    }
    return Math.max(idx, 0);
  };

  const goToStep = useCallback((stepIndex: number) => {
    setState(prev => ({ ...prev, currentStep: stepIndex }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: getNextStepIndex(prev.currentStep, prev.data),
    }));
  }, [state.steps]);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: getPrevStepIndex(prev.currentStep, prev.data),
    }));
  }, [state.steps]);

  // Data management with optimistic update and rollback
  const updateStepData = useCallback((stepId: string, data: WizardStepData) => {
    setRollbackState(state); // Save rollback point
    setState(prev => {
      const newState = {
        ...prev,
        data: {
          ...prev.data,
          [stepId]: data,
        },
      };
      return newState;
    });
  }, [state]);

  // Rollback on error
  const rollback = useCallback(() => {
    if (rollbackState) setState(rollbackState);
  }, [rollbackState]);

  // Validation
  const validateStep = useCallback(async (stepId: string, stepData: WizardStepData): Promise<WizardStepValidation> => {
    try {
      const validation = await reportTemplateAPI.validateWizardStep(stepId, stepData, state.data);
      setState(prev => ({
        ...prev,
        validation: {
          ...prev.validation,
          [prev.currentStep]: validation,
        },
      }));
      return validation;
    } catch {
      const errorValidation = {
        isValid: false,
        errors: [{ field: 'general', message: 'Validation failed' }],
      };
      setState(prev => ({
        ...prev,
        validation: {
          ...prev.validation,
          [prev.currentStep]: errorValidation,
        },
      }));
      rollback();
      return errorValidation;
    }
  }, [state.data, state.currentStep, rollback]);

  // Template submission
  const submitTemplate = useCallback(async (): Promise<ReportTemplate> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    try {
      // Convert wizard data to template format
      const templateData = {
        name: state.data['basic-info']?.name,
        description: state.data['basic-info']?.description,
        category: state.data['basic-info']?.category,
        templateType: state.data['basic-info']?.templateType,
        tags: state.data['basic-info']?.tags || [],
        dataSourceConfig: {
          type: 'database',
          connectionId: state.data['data-source']?.dataSourceId,
          query: state.data['data-source']?.queryConfig,
          parameters: state.data['data-source']?.parameters || [],
        },
        layoutConfig: {
          sections: state.data['layout']?.sections || [],
          styling: state.data['styling'] || {},
          responsive: state.data['layout']?.responsive || {},
        },
        parametersConfig: state.data['parameters']?.parameters || [],
        outputConfig: {
          formats: ['pdf'],
          scheduling: { enabled: false },
          distribution: { enabled: false },
        },
        bindings: state.data['binding']?.bindings || [],
      };
      if (templateId) {
        return await reportTemplateAPI.updateTemplate(templateId, templateData);
      } else {
        return await reportTemplateAPI.createTemplate(templateData);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save template',
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
      setLastSaved(new Date());
      clearPersistedState(templateId);
    }
  }, [state.data, templateId]);

  // Auto-save: only save if data changed since last save
  useEffect(() => {
    if (!autoSaveEnabled || !templateId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      // Compare with last saved (could be improved with a hash)
      const persisted = getPersistedState(templateId);
      if (JSON.stringify(persisted?.data) !== JSON.stringify(state.data)) {
        // Save to backend or localStorage
        persistState(state, templateId);
        setLastSaved(new Date());
      }
    }, 30000); // 30s
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [state.data, autoSaveEnabled, templateId]);

  // Conflict resolution: check for newer backend version (not fully implemented)
  // Could be implemented with a version/timestamp field

  // Clear/reset wizard state
  const clearWizard = useCallback(() => {
    clearPersistedState(templateId);
    setState({
      currentStep: 0,
      steps: WIZARD_STEPS,
      data: {},
      validation: {},
      isLoading: false,
      error: undefined,
    });
  }, [templateId]);

  // Load existing template if editing
  const loadTemplate = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    try {
      const template = await reportTemplateAPI.getTemplate(id);
      // Convert template data to wizard format
      const wizardData = {
        'basic-info': {
          name: template.name,
          description: template.description || '',
          category: template.category,
          templateType: template.templateType,
          tags: template.tags,
        },
        'data-source': {
          dataSourceId: template.dataSourceConfig.connectionId,
          queryMode: 'visual',
          queryConfig: template.dataSourceConfig.query || {},
          sqlQuery: '',
          parameters: template.dataSourceConfig.parameters || [],
        },
        'field-config': {
          selectedFields: template.dataSourceConfig.query?.fields || [],
          fieldFormatting: {},
          fieldOrdering: [],
          groupingConfig: {},
        },
        'layout': {
          sections: template.layoutConfig.sections,
          styling: template.layoutConfig.styling || {},
          responsive: template.layoutConfig.responsive || {},
        },
        'styling': {
          colors: template.layoutConfig.styling?.colors || {},
          fonts: template.layoutConfig.styling?.fonts || {},
          spacing: template.layoutConfig.styling?.spacing || {},
          branding: {},
        },
        'parameters': {
          parameters: template.parametersConfig,
        },
        'binding': {
          bindings: template.bindings || [],
        },
        'review': {
          templatePreview: template,
          validationResults: { isValid: true, errors: [] },
        },
      };
      setState(prev => ({
        ...prev,
        data: wizardData,
        isLoading: false,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load template',
      }));
    }
  }, []);

  // Manual save
  const manualSave = useCallback(() => {
    try {
      persistState(state, templateId, 'manual-save');
      setLastSaved(new Date());
      setPersistError(null);
    } catch {
      setPersistError('Manual save failed.');
    }
  }, [state, templateId]);

  // Recovery: check for conflicts between local/session/server
  const [conflict, setConflict] = useState<{ type: string; local: WizardState; remote?: WizardState } | null>(null);
  const checkForConflict = useCallback(async () => {
    // Example: compare local/session with server (if templateId)
    if (!templateId) return;
    const local = getPersistedState(templateId);
    let remote: WizardState | undefined;
    try {
      const template = await reportTemplateAPI.getTemplate(templateId);
      // Convert to wizard state shape if needed
      // ...
      // remote = ...
    } catch {}
    if (local && remote && JSON.stringify(local) !== JSON.stringify(remote)) {
      setConflict({ type: 'server', local, remote });
    }
  }, [templateId]);

  // Cleanup old versions (keep last N audit entries)
  const cleanupOldVersions = useCallback(() => {
    try {
      const key = `${LOCAL_STORAGE_KEY}${templateId ? '-' + templateId : ''}`;
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (!raw) return;
      const persisted = JSON.parse(raw);
      if (persisted && persisted.audit && persisted.audit.length > MAX_AUDIT_ENTRIES) {
        persisted.audit = persisted.audit.slice(-MAX_AUDIT_ENTRIES);
        const str = JSON.stringify(persisted);
        localStorage.setItem(key, str);
        sessionStorage.setItem(key, str);
      }
    } catch {}
  }, [templateId]);

  // Aggregates all step validations for the review step
  const aggregateValidations = useCallback(() => {
    const allValidations = Object.values(state.validation || {});
    const errors = [];
    const warnings = [];
    const recommendations = [];
    allValidations.forEach((validation) => {
      if (!validation) return;
      if (validation.errors) {
        validation.errors.forEach((err) => {
          if (err.severity === 'error' || err.severity === undefined) {
            errors.push(err);
          } else if (err.severity === 'warning') {
            warnings.push(err);
          } else if (err.severity === 'recommendation') {
            recommendations.push(err);
          }
        });
      }
    });
    return {
      errors,
      warnings,
      recommendations,
      isValid: errors.length === 0,
    };
  }, [state.validation]);

  return {
    // State
    currentStep: state.currentStep,
    steps: state.steps,
    wizardData: state.data,
    validation: state.validation,
    isLoading: state.isLoading,
    error: state.error,
    lastSaved,

    // Navigation
    goToStep,
    nextStep,
    previousStep,

    // Data management
    updateStepData,
    loadTemplate,
    clearWizard,

    // Validation
    validateStep,

    // Submission
    submitTemplate,

    // Auto-save
    autoSaveEnabled,
    setAutoSaveEnabled,

    // Manual save
    manualSave,
    exportWizardState: () => exportWizardState(templateId),
    importWizardState: (data: string) => importWizardState(data, templateId),
    persistError,
    conflict,
    checkForConflict,
    cleanupOldVersions,
    aggregateValidations,
  };
}; 