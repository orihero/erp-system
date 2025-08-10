import React, { useState } from 'react';
import { WizardStepProps, WizardStepData } from '../../../types/wizard';
import { ParameterConfig } from '../../../types/reportTemplate';
import { Modal } from '../ReportWizard/Modal';

// Helper: Default parameter template
const defaultParameter: ParameterConfig = {
  id: '',
  name: '',
  label: '',
  type: 'text',
  required: false,
  defaultValue: '',
  validation: {},
  options: [],
  dependencies: [],
  group: '',
  order: 0,
  ui: {},
  description: '',
};

function getParametersConfig(data: WizardStepData): ParameterConfig[] {
  if (data && Array.isArray((data as { parametersConfig?: unknown }).parametersConfig)) {
    return (data as { parametersConfig: ParameterConfig[] }).parametersConfig;
  }
  return [];
}

export const ParametersStep: React.FC<WizardStepProps<WizardStepData>> = ({ data = {}, onDataChange }) => {
  const [parameters, setParameters] = useState<ParameterConfig[]>(getParametersConfig(data));
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(false);

  // Real-time validation feedback
  const validateParameter = (param: ParameterConfig): string[] => {
    const errors: string[] = [];
    if (!param.name) errors.push('Name is required');
    if (!param.label) errors.push('Label is required');
    if (!param.type) errors.push('Type is required');
    if ((param.type === 'dropdown' || param.type === 'multi-select') && (!param.options || param.options.length === 0)) {
      errors.push('Options are required for dropdown/multi-select');
    }
    // Add more advanced validation as needed
    return errors;
  };

  const handleAddParameter = () => {
    setParameters([...parameters, { ...defaultParameter, id: Date.now().toString() }]);
    onDataChange?.({ ...data, parametersConfig: [...parameters, { ...defaultParameter, id: Date.now().toString() }] });
  };

  const handleEditParameter = (idx: number, updated: Partial<ParameterConfig>) => {
    const updatedParams = parameters.map((p, i) => (i === idx ? { ...p, ...updated } : p));
    setParameters(updatedParams);
    onDataChange?.({ ...data, parametersConfig: updatedParams });
  };

  const handleDeleteParameter = (idx: number) => {
    const updatedParams = parameters.filter((_, i) => i !== idx);
    setParameters(updatedParams);
    onDataChange?.({ ...data, parametersConfig: updatedParams });
  };

  // --- Validation Modal ---
  const openValidationModal = () => {
    setShowValidationModal(true);
  };
  const closeValidationModal = () => {
    setShowValidationModal(false);
  };
  // --- Dependency Modal ---
  const openDependencyModal = () => {
    setShowDependencyModal(true);
  };
  const closeDependencyModal = () => {
    setShowDependencyModal(false);
  };

  // --- Render ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Parameters</h2>
        <button className="btn btn-primary" onClick={handleAddParameter}>Add Parameter</button>
      </div>
      <div className="divide-y">
        {parameters.map((param, idx) => {
          const errors = validateParameter(param);
          return (
            <div key={param.id || idx} className="py-4 flex flex-col gap-2">
              <div className="flex gap-4 items-center">
                <input
                  className="input input-bordered w-32"
                  placeholder="Name"
                  value={param.name}
                  onChange={e => handleEditParameter(idx, { name: e.target.value })}
                />
                <input
                  className="input input-bordered w-40"
                  placeholder="Label"
                  value={param.label}
                  onChange={e => handleEditParameter(idx, { label: e.target.value })}
                />
                <select
                  className="select select-bordered w-40"
                  value={param.type}
                  onChange={e => handleEditParameter(idx, { type: e.target.value as ParameterConfig['type'] })}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="multi-select">Multi-Select</option>
                  <option value="file">File</option>
                  <option value="custom">Custom</option>
                </select>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={param.required}
                    onChange={e => handleEditParameter(idx, { required: e.target.checked })}
                  />
                  Required
                </label>
                <button className="btn btn-xs btn-outline" onClick={openValidationModal}>Validation</button>
                <button className="btn btn-xs btn-outline" onClick={openDependencyModal}>Dependencies</button>
                <button className="btn btn-xs btn-error" onClick={() => handleDeleteParameter(idx)}>Delete</button>
              </div>
              {/* Options for dropdown/multi-select */}
              {(param.type === 'dropdown' || param.type === 'multi-select') && (
                <div className="flex gap-2 items-center">
                  <span>Options:</span>
                  <input
                    className="input input-bordered w-80"
                    placeholder="Comma-separated options (label:value)"
                    value={param.options?.map(o => `${o.label}:${o.value}`).join(',') || ''}
                    onChange={e => {
                      const opts = e.target.value.split(',').map(s => {
                        const [label, value] = s.split(':');
                        return { label: label?.trim() || '', value: value?.trim() || '' };
                      });
                      handleEditParameter(idx, { options: opts });
                    }}
                  />
                </div>
              )}
              {/* Grouping */}
              <div className="flex gap-2 items-center">
                <span>Group:</span>
                <input
                  className="input input-bordered w-40"
                  placeholder="Group name"
                  value={param.group || ''}
                  onChange={e => handleEditParameter(idx, { group: e.target.value })}
                />
                <span>Order:</span>
                <input
                  className="input input-bordered w-20"
                  type="number"
                  value={param.order || 0}
                  onChange={e => handleEditParameter(idx, { order: Number(e.target.value) })}
                />
              </div>
              {/* Real-time validation feedback */}
              {errors.length > 0 && (
                <ul className="text-red-500 text-xs list-disc ml-6">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      {/* Validation Rule Builder Modal (stub) */}
      <Modal open={showValidationModal} onClose={closeValidationModal} title="Validation Rule Builder" size="lg">
        <div>
          <p>Visual builder for validation rules (coming soon).</p>
          {/* TODO: Implement drag-and-drop or form-based rule builder */}
        </div>
      </Modal>
      {/* Dependency Editor Modal (stub) */}
      <Modal open={showDependencyModal} onClose={closeDependencyModal} title="Dependency Editor" size="lg">
        <div>
          <p>Visual editor for parameter dependencies (coming soon).</p>
          {/* TODO: Implement graph/list-based dependency editor */}
        </div>
      </Modal>
    </div>
  );
}; 