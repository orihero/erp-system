import React, { useReducer } from 'react';

// Step titles for the wizard
const steps = [
  'Basic Information',
  'Data Source',
  'Field Configuration',
  'Layout & Grouping',
  'Styling & Formatting',
  'Parameters',
  'Company & Module Binding',
  'Review & Save',
];

// Types for state and actions
interface ReportBuilderState {
  currentStep: number;
  report: {
    basicInfo: Record<string, unknown>;
    dataSource: Record<string, unknown>;
    fieldConfig: Record<string, unknown>;
    layout: Record<string, unknown>;
    styling: Record<string, unknown>;
    parameters: Record<string, unknown>;
    binding: Record<string, unknown>;
    review: Record<string, unknown>;
  };
  stepValidity: boolean[];
}

type ReportBuilderAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP_VALID'; step: number; valid: boolean }
  | { type: 'UPDATE_REPORT'; section: keyof ReportBuilderState['report']; data: Record<string, unknown> };

// Initial state for the report builder
const initialState: ReportBuilderState = {
  currentStep: 0,
  report: {
    // Add fields as needed for each step
    basicInfo: {},
    dataSource: {},
    fieldConfig: {},
    layout: {},
    styling: {},
    parameters: {},
    binding: {},
    review: {},
  },
  stepValidity: Array(steps.length).fill(false),
};

// Actions for the reducer
const ACTIONS = {
  NEXT_STEP: 'NEXT_STEP' as const,
  PREV_STEP: 'PREV_STEP' as const,
  SET_STEP_VALID: 'SET_STEP_VALID' as const,
  UPDATE_REPORT: 'UPDATE_REPORT' as const,
};

function reducer(state: ReportBuilderState, action: ReportBuilderAction): ReportBuilderState {
  switch (action.type) {
    case ACTIONS.NEXT_STEP:
      if (state.currentStep < steps.length - 1 && state.stepValidity[state.currentStep]) {
        return { ...state, currentStep: state.currentStep + 1 };
      }
      return state;
    case ACTIONS.PREV_STEP:
      if (state.currentStep > 0) {
        return { ...state, currentStep: state.currentStep - 1 };
      }
      return state;
    case ACTIONS.SET_STEP_VALID:
      return {
        ...state,
        stepValidity: state.stepValidity.map((valid: boolean, idx: number) =>
          idx === action.step ? action.valid : valid
        ),
      };
    case ACTIONS.UPDATE_REPORT:
      return {
        ...state,
        report: {
          ...state.report,
          [action.section]: {
            ...state.report[action.section],
            ...action.data,
          },
        },
      };
    default:
      return state;
  }
}

// Placeholder components for each step
const StepComponents: React.FC[] = [
  () => <div>Basic Information Step (TODO)</div>,
  () => <div>Data Source Step (TODO)</div>,
  () => <div>Field Configuration Step (TODO)</div>,
  () => <div>Layout & Grouping Step (TODO)</div>,
  () => <div>Styling & Formatting Step (TODO)</div>,
  () => <div>Parameters Step (TODO)</div>,
  () => <div>Company & Module Binding Step (TODO)</div>,
  () => <div>Review & Save Step (TODO)</div>,
];

const ReportBuilderWizard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { currentStep, stepValidity } = state;
  const StepComponent = StepComponents[currentStep];

  // Visual progress indicator
  const renderProgress = () => (
    <div style={{ display: 'flex', marginBottom: 24 }}>
      {steps.map((title, idx) => (
        <div
          key={title}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: 8,
            borderBottom: idx === currentStep ? '3px solid #007bff' : '1px solid #ccc',
            fontWeight: idx === currentStep ? 'bold' : 'normal',
            color: idx === currentStep ? '#007bff' : '#888',
            background: idx < currentStep ? '#e6f7ff' : 'transparent',
          }}
        >
          {title}
        </div>
      ))}
    </div>
  );

  // Navigation handlers
  const handleNext = () => {
    dispatch({ type: ACTIONS.NEXT_STEP });
  };
  const handlePrev = () => {
    dispatch({ type: ACTIONS.PREV_STEP });
  };

  // Example validation: only allow next if current step is valid
  const isNextEnabled = stepValidity[currentStep];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h2>Report Builder Wizard</h2>
      {renderProgress()}
      <div style={{ minHeight: 200, marginBottom: 32 }}>
        <StepComponent />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handlePrev} disabled={currentStep === 0}>
          Previous
        </button>
        <button onClick={handleNext} disabled={!isNextEnabled || currentStep === steps.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ReportBuilderWizard; 