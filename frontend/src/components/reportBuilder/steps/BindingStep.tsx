import React, { useState, useEffect, useCallback } from 'react';
import { WizardStepProps, BindingData } from '../../../types/wizard';
import { TemplateBinding, Company, Module } from '../../../types/reportTemplate';
import { Button } from '../../reportBuilder/ReportWizard/Button';
import { Modal } from '../../reportBuilder/ReportWizard/Modal';
import './BindingStep.scss';

// Placeholder hooks and components for missing dependencies
const useCompanies = () => ({ companies: [], isLoading: false, getCompanyHierarchy: async () => null });
const useModules = () => ({ modules: [], isLoading: false, getModulesByCategory: async () => ({}) });

type BindingConfigurationProps = {
  binding: Partial<TemplateBinding>;
  companies: Company[];
  modules: Module[];
  companyHierarchy: unknown;
  modulesByCategory: Record<string, Module[]>;
  onChange: (binding: Partial<TemplateBinding>) => void;
  onSave: () => void;
  onCancel: () => void;
};

const BindingConfiguration: React.FC<BindingConfigurationProps> = () => <div>Binding Configuration (stub)</div>;

export const BindingStep: React.FC<WizardStepProps<BindingData>> = ({
  data,
  onDataChange,
  validation
}) => {
  const { companies, isLoading: companiesLoading, getCompanyHierarchy } = useCompanies();
  const { modules, isLoading: modulesLoading, getModulesByCategory } = useModules();
  
  const [formData, setFormData] = useState<BindingData>({
    ...data,
    bindings: data.bindings || []
  });
  
  const [showAddBindingModal, setShowAddBindingModal] = useState(false);
  const [editingBinding, setEditingBinding] = useState<TemplateBinding | null>(null);
  const [newBinding, setNewBinding] = useState<Partial<TemplateBinding>>({
    bindingType: 'company',
    accessLevel: 'execute',
    inheritanceEnabled: false,
    customizationAllowed: true,
    isActive: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [companyHierarchy, setCompanyHierarchy] = useState<unknown>(null);
  const [modulesByCategory, setModulesByCategory] = useState<Record<string, Module[]>>({});

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  useEffect(() => {
    if (validation?.errors) {
      const errorMap = validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>);
      setErrors(errorMap);
    } else {
      setErrors({});
    }
  }, [validation]);

  useEffect(() => {
    // Load company hierarchy
    getCompanyHierarchy().then(setCompanyHierarchy);
    
    // Load modules by category
    getModulesByCategory().then(setModulesByCategory);
  }, [getCompanyHierarchy, getModulesByCategory]);

  const handleAddBinding = useCallback(() => {
    setNewBinding({
      bindingType: 'company',
      accessLevel: 'execute',
      inheritanceEnabled: false,
      customizationAllowed: true,
      isActive: true
    });
    setEditingBinding(null);
    setShowAddBindingModal(true);
  }, []);

  const handleEditBinding = useCallback((binding: TemplateBinding) => {
    setNewBinding(binding);
    setEditingBinding(binding);
    setShowAddBindingModal(true);
  }, []);

  const handleDeleteBinding = useCallback((bindingId: string) => {
    setFormData(prev => ({
      ...prev,
      bindings: prev.bindings.filter(b => b.id !== bindingId)
    }));
  }, []);

  const handleSaveBinding = useCallback(() => {
    // Validate binding
    const bindingErrors: string[] = [];
    
    if (!newBinding.bindingType) {
      bindingErrors.push('Binding type is required');
    }
    
    if (newBinding.bindingType === 'company' && !newBinding.companyId) {
      bindingErrors.push('Company is required for company binding');
    }
    
    if (newBinding.bindingType === 'module' && !newBinding.moduleId) {
      bindingErrors.push('Module is required for module binding');
    }
    
    if (newBinding.bindingType === 'company_module' && (!newBinding.companyId || !newBinding.moduleId)) {
      bindingErrors.push('Both company and module are required for company-module binding');
    }

    if (bindingErrors.length > 0) {
      // Show validation errors
      console.error('Binding validation errors:', bindingErrors);
      return;
    }

    // Check for duplicate bindings
    const isDuplicate = formData.bindings.some(binding => 
      binding.id !== editingBinding?.id &&
      binding.companyId === newBinding.companyId &&
      binding.moduleId === newBinding.moduleId &&
      binding.bindingType === newBinding.bindingType
    );

    if (isDuplicate) {
      console.error('Duplicate binding detected');
      return;
    }

    const bindingToSave: TemplateBinding = {
      id: editingBinding?.id || `binding-${Date.now()}`,
      reportStructureId: '', // Will be set when template is created
      companyId: newBinding.companyId || undefined,
      moduleId: newBinding.moduleId || undefined,
      bindingType: newBinding.bindingType!,
      accessLevel: newBinding.accessLevel || 'execute',
      inheritanceEnabled: newBinding.inheritanceEnabled || false,
      customizationAllowed: newBinding.customizationAllowed !== false,
      isActive: newBinding.isActive !== false,
      createdBy: '', // Will be set by backend
      createdAt: new Date().toISOString(),
      company: newBinding.companyId ? companies.find((c: Company) => c.id === newBinding.companyId) : undefined,
      module: newBinding.moduleId ? modules.find((m: Module) => m.id === newBinding.moduleId) : undefined,
    };

    if (editingBinding) {
      // Update existing binding
      setFormData(prev => ({
        ...prev,
        bindings: prev.bindings.map(b => 
          b.id === editingBinding.id ? bindingToSave : b
        )
      }));
    } else {
      // Add new binding
      setFormData(prev => ({
        ...prev,
        bindings: [...prev.bindings, bindingToSave]
      }));
    }

    setShowAddBindingModal(false);
    setEditingBinding(null);
  }, [newBinding, editingBinding, formData.bindings, companies, modules]);

  const getBindingDisplayName = useCallback((binding: TemplateBinding) => {
    const parts: string[] = [];
    
    if (binding.company) {
      parts.push(binding.company.name);
    }
    
    if (binding.module) {
      parts.push(binding.module.name);
    }
    
    if (parts.length === 0) {
      switch (binding.bindingType) {
        case 'global':
          return 'Global Access';
        default:
          return 'Unknown Binding';
      }
    }
    
    return parts.join(' → ');
  }, []);

  const getAccessLevelColor = useCallback((level: string) => {
    switch (level) {
      case 'read': return 'blue';
      case 'execute': return 'green';
      case 'modify': return 'orange';
      case 'admin': return 'red';
      default: return 'gray';
    }
  }, []);

  if (companiesLoading || modulesLoading) {
    return (
      <div className="binding-step__loading">
        <div className="loading-spinner" />
        <p>Loading companies and modules...</p>
      </div>
    );
  }

  return (
    <div className="binding-step">
      <div className="form-section">
        <div className="section-header">
          <h3>Template Access Bindings</h3>
          <p>
            Configure which companies and modules can access this report template. 
            You can create multiple bindings with different access levels.
          </p>
        </div>

        <div className="bindings-list">
          {formData.bindings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔗</div>
              <h4>No bindings configured</h4>
              <p>Add at least one binding to specify who can access this template.</p>
            </div>
          ) : (
            <div className="bindings-grid">
              {formData.bindings.map((binding) => (
                <div key={binding.id} className="binding-card">
                  <div className="binding-header">
                    <div className="binding-title">
                      {getBindingDisplayName(binding)}
                    </div>
                    <div className="binding-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBinding(binding)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBinding(binding.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="binding-details">
                    <div className="binding-type">
                      <span className="label">Type:</span>
                      <span className="value">{binding.bindingType.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="access-level">
                      <span className="label">Access:</span>
                      <span className={`access-badge ${getAccessLevelColor(binding.accessLevel)}`}>
                        {binding.accessLevel}
                      </span>
                    </div>
                    
                    {binding.inheritanceEnabled && (
                      <div className="inheritance-indicator">
                        <span className="inheritance-badge">Inheritance Enabled</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="add-binding-section">
          <Button
            variant="primary"
            onClick={handleAddBinding}
          >
            Add Binding
          </Button>
        </div>

        {errors.bindings && (
          <div className="error-message">
            {errors.bindings}
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>Binding Summary</h3>
        <div className="binding-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-value">{formData.bindings.length}</div>
              <div className="stat-label">Total Bindings</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">
                {formData.bindings.filter(b => b.bindingType === 'company').length}
              </div>
              <div className="stat-label">Company Bindings</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">
                {formData.bindings.filter(b => b.bindingType === 'module').length}
              </div>
              <div className="stat-label">Module Bindings</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">
                {formData.bindings.filter(b => b.inheritanceEnabled).length}
              </div>
              <div className="stat-label">With Inheritance</div>
            </div>
          </div>
        </div>
      </div>

      {showAddBindingModal && (
        <Modal
          title={editingBinding ? 'Edit Binding' : 'Add New Binding'}
          onClose={() => setShowAddBindingModal(false)}
        >
          <BindingConfiguration
            binding={newBinding}
            companies={companies}
            modules={modules}
            companyHierarchy={companyHierarchy}
            modulesByCategory={modulesByCategory}
            onChange={setNewBinding}
            onSave={handleSaveBinding}
            onCancel={() => setShowAddBindingModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}; 