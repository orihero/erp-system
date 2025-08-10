const { sequelize } = require('../models');

class ValidationService {
  
  static async validateTemplateData(templateData) {
    const errors = [];
    
    // Basic validation
    if (!templateData.name || templateData.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Template name is required' });
    }
    
    if (templateData.name && templateData.name.length > 255) {
      errors.push({ field: 'name', message: 'Template name must be less than 255 characters' });
    }
    
    if (!templateData.category) {
      errors.push({ field: 'category', message: 'Category is required' });
    }
    
    const validCategories = ['financial', 'operational', 'hr', 'sales', 'inventory', 'custom'];
    if (templateData.category && !validCategories.includes(templateData.category)) {
      errors.push({ field: 'category', message: 'Invalid category' });
    }
    
    if (!templateData.templateType) {
      errors.push({ field: 'templateType', message: 'Template type is required' });
    }
    
    const validTemplateTypes = ['tabular', 'chart', 'dashboard', 'document'];
    if (templateData.templateType && !validTemplateTypes.includes(templateData.templateType)) {
      errors.push({ field: 'templateType', message: 'Invalid template type' });
    }
    
    // Deep validation for dataSourceConfig
    if (!templateData.dataSourceConfig || typeof templateData.dataSourceConfig !== 'object') {
      errors.push({ field: 'dataSourceConfig', message: 'Data source configuration is required' });
    } else {
      const dsErrors = this.validateDataSourceConfig(templateData.dataSourceConfig);
      errors.push(...dsErrors);
      // Deep checks for database type
      if (templateData.dataSourceConfig.type === 'database') {
        if (!templateData.dataSourceConfig.queryMode || !['visual', 'sql'].includes(templateData.dataSourceConfig.queryMode)) {
          errors.push({ field: 'dataSourceConfig.queryMode', message: 'Query mode must be visual or sql' });
        }
        if (templateData.dataSourceConfig.queryMode === 'sql') {
          if (!templateData.dataSourceConfig.sqlQuery || typeof templateData.dataSourceConfig.sqlQuery !== 'string') {
            errors.push({ field: 'dataSourceConfig.sqlQuery', message: 'SQL query is required for SQL mode' });
          }
        }
        if (templateData.dataSourceConfig.queryMode === 'visual') {
          if (!templateData.dataSourceConfig.tables || !Array.isArray(templateData.dataSourceConfig.tables) || templateData.dataSourceConfig.tables.length === 0) {
            errors.push({ field: 'dataSourceConfig.tables', message: 'At least one table is required for visual mode' });
          }
          if (!templateData.dataSourceConfig.fields || !Array.isArray(templateData.dataSourceConfig.fields) || templateData.dataSourceConfig.fields.length === 0) {
            errors.push({ field: 'dataSourceConfig.fields', message: 'At least one field is required for visual mode' });
          }
        }
      }
    }
    
    // Deep validation for layoutConfig
    if (!templateData.layoutConfig || typeof templateData.layoutConfig !== 'object') {
      errors.push({ field: 'layoutConfig', message: 'Layout configuration is required' });
    } else {
      const layoutErrors = this.validateLayoutConfig(templateData.layoutConfig);
      errors.push(...layoutErrors);
      // Deep checks for sections
      if (!templateData.layoutConfig.sections || !Array.isArray(templateData.layoutConfig.sections) || templateData.layoutConfig.sections.length === 0) {
        errors.push({ field: 'layoutConfig.sections', message: 'At least one section is required' });
      } else {
        templateData.layoutConfig.sections.forEach((section, idx) => {
          if (!section.type) {
            errors.push({ field: `layoutConfig.sections[${idx}].type`, message: 'Section type is required' });
          }
          if (!section.fields || !Array.isArray(section.fields)) {
            errors.push({ field: `layoutConfig.sections[${idx}].fields`, message: 'Section fields must be an array' });
          }
        });
      }
    }
    
    // Deep validation for parametersConfig
    if (templateData.parametersConfig) {
      const paramErrors = this.validateParametersConfig(templateData.parametersConfig);
      errors.push(...paramErrors);
      // Deep checks for required fields, types, and constraints
      if (Array.isArray(templateData.parametersConfig)) {
        templateData.parametersConfig.forEach((param, idx) => {
          if (!param.name || typeof param.name !== 'string') {
            errors.push({ field: `parametersConfig[${idx}].name`, message: 'Parameter name is required and must be a string' });
          }
          if (!param.type || typeof param.type !== 'string') {
            errors.push({ field: `parametersConfig[${idx}].type`, message: 'Parameter type is required and must be a string' });
          }
          if (param.required && (param.defaultValue === undefined || param.defaultValue === null)) {
            errors.push({ field: `parametersConfig[${idx}].defaultValue`, message: 'Required parameter should have a default value or be handled in UI.' });
          }
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateDataSourceConfig(config) {
    const errors = [];
    
    if (!config.type) {
      errors.push({ field: 'dataSourceConfig.type', message: 'Data source type is required' });
    }
    
    const validTypes = ['database', 'api', 'file'];
    if (config.type && !validTypes.includes(config.type)) {
      errors.push({ field: 'dataSourceConfig.type', message: 'Invalid data source type' });
    }
    
    if (!config.connectionId) {
      errors.push({ field: 'dataSourceConfig.connectionId', message: 'Connection ID is required' });
    }
    
    return errors;
  }
  
  static validateLayoutConfig(config) {
    const errors = [];
    
    if (!config.sections || !Array.isArray(config.sections)) {
      errors.push({ field: 'layoutConfig.sections', message: 'Sections array is required' });
    }
    
    return errors;
  }
  
  /**
   * Parameter Schema Example (for parametersConfig):
   * [
   *   {
   *     name: 'startDate',
   *     label: 'Start Date',
   *     type: 'date', // 'text', 'number', 'date', 'dropdown', 'multi-select', 'file', 'custom'
   *     required: true,
   *     validation: {
   *       format: 'YYYY-MM-DD',
   *       min: '2020-01-01',
   *       max: '2030-12-31',
   *       regex: '^\\d{4}-\\d{2}-\\d{2}$',
   *       customRule: 'value > otherParam', // expression or function name
   *     },
   *     options: [ { label: 'A', value: 'a' }, { label: 'B', value: 'b' } ], // for dropdown/multi-select
   *     dependencies: [
   *       { parameter: 'otherParam', condition: 'equals', value: 'x', action: 'show' },
   *       { parameter: 'otherParam', condition: 'in', value: ['a','b'], action: 'enable' }
   *     ],
   *     defaultValue: '2022-01-01',
   *     defaultStrategy: { type: 'dynamic', expression: 'today()' },
   *     group: 'Date Range',
   *     order: 1,
   *     ui: { widget: 'datepicker', placeholder: 'Select date' },
   *   },
   *   ...
   * ]
   */
  static validateParametersConfig(config) {
    const errors = [];
    if (!Array.isArray(config)) {
      errors.push({ field: 'parametersConfig', message: 'Parameters configuration must be an array' });
      return errors;
    }
    const validTypes = ['text', 'number', 'date', 'dropdown', 'multi-select', 'file', 'custom'];
    config.forEach((param, index) => {
      if (!param.name) {
        errors.push({ field: `parametersConfig[${index}].name`, message: 'Parameter name is required' });
      }
      if (!param.type) {
        errors.push({ field: `parametersConfig[${index}].type`, message: 'Parameter type is required' });
      } else if (!validTypes.includes(param.type)) {
        errors.push({ field: `parametersConfig[${index}].type`, message: `Invalid parameter type: ${param.type}` });
      }
      // Required field
      if (param.required && (param.defaultValue === undefined || param.defaultValue === null)) {
        errors.push({ field: `parametersConfig[${index}].defaultValue`, message: 'Required parameter should have a default value or be handled in UI.' });
      }
      // Validation rules
      if (param.validation) {
        if (param.type === 'number') {
          if (param.validation.min !== undefined && typeof param.validation.min !== 'number') {
            errors.push({ field: `parametersConfig[${index}].validation.min`, message: 'Min must be a number' });
          }
          if (param.validation.max !== undefined && typeof param.validation.max !== 'number') {
            errors.push({ field: `parametersConfig[${index}].validation.max`, message: 'Max must be a number' });
          }
        }
        if (param.type === 'text' && param.validation.regex) {
          try { new RegExp(param.validation.regex); } catch { errors.push({ field: `parametersConfig[${index}].validation.regex`, message: 'Invalid regex' }); }
        }
        // Add more type-specific validation as needed
      }
      // Options for dropdown/multi-select
      if ((param.type === 'dropdown' || param.type === 'multi-select') && (!Array.isArray(param.options) || param.options.length === 0)) {
        errors.push({ field: `parametersConfig[${index}].options`, message: 'Options are required for dropdown/multi-select' });
      }
      // Dependencies
      if (param.dependencies) {
        if (!Array.isArray(param.dependencies)) {
          errors.push({ field: `parametersConfig[${index}].dependencies`, message: 'Dependencies must be an array' });
        } else {
          param.dependencies.forEach((dep, depIdx) => {
            if (!dep.parameter || !dep.condition || dep.value === undefined || !dep.action) {
              errors.push({ field: `parametersConfig[${index}].dependencies[${depIdx}]`, message: 'Dependency must specify parameter, condition, value, and action' });
            }
          });
        }
      }
      // Grouping
      if (param.group && typeof param.group !== 'string') {
        errors.push({ field: `parametersConfig[${index}].group`, message: 'Group must be a string' });
      }
      // UI hints
      if (param.ui && typeof param.ui !== 'object') {
        errors.push({ field: `parametersConfig[${index}].ui`, message: 'UI must be an object' });
      }
    });
    return errors;
  }
  
  static async validateWizardStep(stepId, stepData, allWizardData) {
    const errors = [];
    
    switch (stepId) {
      case 'basic-info':
        return this.validateBasicInfoStep(stepData);
      case 'data-source':
        return this.validateDataSourceStep(stepData);
      case 'field-config':
        return this.validateFieldConfigStep(stepData);
      case 'layout':
        return this.validateLayoutStep(stepData);
      case 'styling':
        return this.validateStylingStep(stepData);
      case 'parameters':
        return this.validateParametersStep(stepData);
      case 'binding':
        return this.validateBindingStep(stepData);
      case 'review':
        return this.validateReviewStep(allWizardData);
      default:
        return { isValid: true, errors: [] };
    }
  }
  
  static validateBasicInfoStep(stepData) {
    const errors = [];
    
    if (!stepData.name || stepData.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Template name is required' });
    }
    
    if (!stepData.category) {
      errors.push({ field: 'category', message: 'Category is required' });
    }
    
    if (!stepData.templateType) {
      errors.push({ field: 'templateType', message: 'Template type is required' });
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  static validateDataSourceStep(stepData) {
    const errors = [];
    
    if (!stepData.dataSourceId) {
      errors.push({ field: 'dataSourceId', message: 'Data source is required' });
    }
    
    if (stepData.queryMode === 'visual') {
      if (!stepData.queryConfig || !stepData.queryConfig.tables || stepData.queryConfig.tables.length === 0) {
        errors.push({ field: 'queryConfig.tables', message: 'At least one table must be selected' });
      }
      
      if (!stepData.queryConfig.fields || stepData.queryConfig.fields.length === 0) {
        errors.push({ field: 'queryConfig.fields', message: 'At least one field must be selected' });
      }
    } else if (stepData.queryMode === 'sql') {
      if (!stepData.sqlQuery || stepData.sqlQuery.trim().length === 0) {
        errors.push({ field: 'sqlQuery', message: 'SQL query is required' });
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  static validateBindingStep(stepData) {
    const errors = [];
    if (!stepData.bindings || !Array.isArray(stepData.bindings) || stepData.bindings.length === 0) {
      errors.push({ field: 'bindings', message: 'At least one binding is required' });
    } else {
      stepData.bindings.forEach((binding, index) => {
        if (!binding.bindingType) {
          errors.push({ field: `bindings[${index}].bindingType`, message: 'Binding type is required' });
        }
        if (binding.bindingType === 'company' && (!binding.companyId || typeof binding.companyId !== 'number')) {
          errors.push({ field: `bindings[${index}].companyId`, message: 'Valid companyId is required for company binding' });
        }
        if (binding.bindingType === 'module' && (!binding.moduleId || typeof binding.moduleId !== 'number')) {
          errors.push({ field: `bindings[${index}].moduleId`, message: 'Valid moduleId is required for module binding' });
        }
        if (binding.bindingType === 'company_module') {
          if (!binding.companyId || typeof binding.companyId !== 'number') {
            errors.push({ field: `bindings[${index}].companyId`, message: 'Valid companyId is required for company-module binding' });
          }
          if (!binding.moduleId || typeof binding.moduleId !== 'number') {
            errors.push({ field: `bindings[${index}].moduleId`, message: 'Valid moduleId is required for company-module binding' });
          }
        }
      });
    }
    return { isValid: errors.length === 0, errors };
  }
  
  // Additional validation methods for other steps...
  static validateFieldConfigStep(stepData) {
    return { isValid: true, errors: [] };
  }
  
  static validateLayoutStep(stepData) {
    return { isValid: true, errors: [] };
  }
  
  static validateStylingStep(stepData) {
    return { isValid: true, errors: [] };
  }
  
  static validateParametersStep(stepData) {
    return { isValid: true, errors: [] };
  }
  
  static validateReviewStep(allWizardData) {
    // Validate the complete template configuration
    return this.validateTemplateData(allWizardData);
  }
  
  /**
   * Validate a SQL query using EXPLAIN. Only allows SELECT queries. Returns errors if invalid or unsafe.
   * @param {string} sqlQuery
   * @returns {Promise<{isValid: boolean, errors: Array}>}
   */
  static async validateQuery(sqlQuery) {
    const errors = [];
    if (!sqlQuery || typeof sqlQuery !== 'string' || sqlQuery.trim().length === 0) {
      errors.push({ field: 'sqlQuery', message: 'SQL query is required' });
      return { isValid: false, errors };
    }
    // Only allow SELECT queries
    const trimmed = sqlQuery.trim().toLowerCase();
    if (!trimmed.startsWith('select')) {
      errors.push({ field: 'sqlQuery', message: 'Only SELECT queries are allowed' });
      return { isValid: false, errors };
    }
    // Disallow forbidden statements
    const forbidden = ['insert', 'update', 'delete', 'drop', 'alter', 'truncate', 'create', 'grant', 'revoke'];
    for (const keyword of forbidden) {
      if (trimmed.includes(keyword + ' ')) {
        errors.push({ field: 'sqlQuery', message: `Query contains forbidden statement: ${keyword}` });
        return { isValid: false, errors };
      }
    }
    // Try EXPLAIN
    try {
      await sequelize.query('EXPLAIN ' + sqlQuery, { type: sequelize.QueryTypes.SELECT });
    } catch (err) {
      errors.push({ field: 'sqlQuery', message: 'SQL query is invalid: ' + (err.message || err.toString()) });
      return { isValid: false, errors };
    }
    return { isValid: errors.length === 0, errors };
  }
}

module.exports = ValidationService; 