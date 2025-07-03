const { ReportStructure, ReportTemplateVersion, ReportExecutionHistory, User, Company } = require('../models');
const ReportGenerationService = require('../services/ReportGenerationService');
const DataSourceService = require('../services/DataSourceService');
const ValidationService = require('../services/ValidationService');
const { Op } = require('sequelize');

class ReportTemplateController {
  
  async listTemplates(req, res) {
    try {
      const { page = 1, limit = 10, category, search, companyId } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {
        isActive: true
      };

      if (category) {
        whereClause.category = category;
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filter by user's accessible companies
      if (companyId) {
        whereClause.companyId = companyId;
      }

      const templates = await ReportStructure.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: Company, as: 'company', attributes: ['id', 'name'] }
        ],
        order: [['updatedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        templates: templates.rows,
        pagination: {
          total: templates.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(templates.count / limit)
        }
      });
    } catch (error) {
      console.error('Error listing templates:', error);
      res.status(500).json({ error: 'Failed to list templates' });
    }
  }

  async createTemplate(req, res) {
    try {
      const {
        name,
        description,
        category,
        templateType,
        tags,
        dataSourceConfig,
        layoutConfig,
        parametersConfig,
        outputConfig,
        bindings
      } = req.body;

      // Validate template data
      const validation = await ValidationService.validateTemplateData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.errors 
        });
      }

      // Create template
      const template = await ReportStructure.create({
        name,
        description,
        category,
        templateType,
        tags: tags || [],
        dataSourceConfig,
        layoutConfig,
        parametersConfig: parametersConfig || [],
        outputConfig,
        createdBy: req.user.id,
        companyId: req.user.companyId
      });

      // Create initial version
      await template.createVersion({
        action: 'created',
        data: template.toJSON()
      }, req.user.id);

      // Create bindings if provided
      if (bindings && bindings.length > 0) {
        const { ReportTemplateBinding } = require('../models');
        for (const binding of bindings) {
          await ReportTemplateBinding.create({
            reportStructureId: template.id,
            companyId: binding.companyId,
            moduleId: binding.moduleId,
            bindingType: binding.bindingType,
            accessLevel: binding.accessLevel || 'execute',
            createdBy: req.user.id
          });
        }
      }

      // Fetch complete template with associations
      const completeTemplate = await ReportStructure.findByPk(template.id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: Company, as: 'company', attributes: ['id', 'name'] }
        ]
      });

      res.status(201).json(completeTemplate);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  async getTemplate(req, res) {
    try {
      const { id } = req.params;
      
      const template = await ReportStructure.findByPk(id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'updater', attributes: ['id', 'name', 'email'] },
          { model: Company, as: 'company', attributes: ['id', 'name'] },
          { 
            model: ReportTemplateVersion, 
            as: 'versions',
            limit: 5,
            order: [['version', 'DESC']]
          }
        ]
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Check access permissions
      const hasAccess = await this.checkTemplateAccess(template, req.user);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(template);
    } catch (error) {
      console.error('Error getting template:', error);
      res.status(500).json({ error: 'Failed to get template' });
    }
  }

  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const template = await ReportStructure.findByPk(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Check permissions
      const hasAccess = await this.checkTemplateAccess(template, req.user, 'modify');
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Validate update data
      const validation = await ValidationService.validateTemplateData(updateData);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.errors 
        });
      }

      // Store previous version
      const previousData = template.toJSON();
      
      // Update template
      await template.update({
        ...updateData,
        updatedBy: req.user.id
      });

      // Increment version and create version record
      await template.incrementVersion(req.user.id);
      await template.createVersion({
        action: 'updated',
        previous: previousData,
        current: template.toJSON(),
        changes: this.calculateChanges(previousData, template.toJSON())
      }, req.user.id);

      // Fetch updated template with associations
      const updatedTemplate = await ReportStructure.findByPk(id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'updater', attributes: ['id', 'name', 'email'] },
          { model: Company, as: 'company', attributes: ['id', 'name'] }
        ]
      });

      res.json(updatedTemplate);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }

  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      
      const template = await ReportStructure.findByPk(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Check permissions
      const hasAccess = await this.checkTemplateAccess(template, req.user, 'admin');
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Soft delete by setting isActive to false
      await template.update({
        isActive: false,
        updatedBy: req.user.id
      });

      // Create version record for deletion
      await template.createVersion({
        action: 'deleted',
        data: template.toJSON()
      }, req.user.id);

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = [
        { id: 'financial', name: 'Financial Reports', description: 'Financial statements, budgets, and accounting reports' },
        { id: 'operational', name: 'Operational Reports', description: 'Operations, performance, and efficiency reports' },
        { id: 'hr', name: 'Human Resources', description: 'Employee, payroll, and HR management reports' },
        { id: 'sales', name: 'Sales Reports', description: 'Sales performance, customer, and revenue reports' },
        { id: 'inventory', name: 'Inventory Reports', description: 'Stock levels, movements, and warehouse reports' },
        { id: 'custom', name: 'Custom Reports', description: 'Custom and specialized reports' }
      ];

      res.json(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: 'Failed to get categories' });
    }
  }

  async getDataSources(req, res) {
    try {
      const dataSources = await DataSourceService.getAvailableDataSources(req.user);
      res.json(dataSources);
    } catch (error) {
      console.error('Error getting data sources:', error);
      res.status(500).json({ error: 'Failed to get data sources' });
    }
  }

  async getDataSourceSchema(req, res) {
    try {
      const { id } = req.params;
      const schema = await DataSourceService.getDataSourceSchema(id, req.user);
      res.json(schema);
    } catch (error) {
      console.error('Error getting data source schema:', error);
      res.status(500).json({ error: 'Failed to get data source schema' });
    }
  }

  async testDataSource(req, res) {
    try {
      const { id } = req.params;
      const result = await DataSourceService.testConnection(id, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error testing data source:', error);
      res.status(500).json({ error: 'Failed to test data source' });
    }
  }

  async validateQuery(req, res) {
    try {
      const { query, dataSourceId } = req.body;
      const result = await DataSourceService.validateQuery(query, dataSourceId, req.user);
      res.json(result);
    } catch (error) {
      console.error('Error validating query:', error);
      res.status(500).json({ error: 'Failed to validate query' });
    }
  }

  async generateReport(req, res) {
    try {
      const { id } = req.params;
      const { parameters, format = 'pdf' } = req.body;

      const template = await ReportStructure.findByPk(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Check access permissions
      const hasAccess = await this.checkTemplateAccess(template, req.user, 'execute');
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Create execution record
      const execution = await ReportExecutionHistory.create({
        reportStructureId: id,
        parameters: parameters || {},
        executedBy: req.user.id
      });

      // Start report generation (async)
      ReportGenerationService.generateReport(template, parameters, format, execution.id)
        .catch(error => {
          console.error('Report generation failed:', error);
          execution.markAsFailed(error.message);
        });

      res.json({ 
        executionId: execution.id,
        status: 'pending',
        message: 'Report generation started'
      });
    } catch (error) {
      console.error('Error starting report generation:', error);
      res.status(500).json({ error: 'Failed to start report generation' });
    }
  }

  async validateTemplateName(req, res) {
    try {
      const { name, companyId } = req.body;
      if (!name || !companyId) {
        return res.status(400).json({ isAvailable: false, error: 'Name and companyId are required.' });
      }
      // Naming rules
      const trimmed = name.trim();
      const maxLength = 255;
      const allowed = /^[a-zA-Z0-9 _\-]+$/;
      if (trimmed.length === 0 || trimmed.length > maxLength || !allowed.test(trimmed)) {
        return res.status(400).json({
          isAvailable: false,
          error: 'Name must be 1-255 characters and contain only letters, numbers, spaces, underscores, or hyphens.'
        });
      }
      // Uniqueness check (case-insensitive)
      const existing = await require('../models').ReportStructure.findOne({
        where: {
          name: { [Op.iLike]: trimmed },
          companyId
        }
      });
      if (!existing) {
        return res.json({ isAvailable: true, suggestions: [] });
      }
      // Suggest alternatives
      const suggestions = [];
      for (let i = 1; i <= 3; i++) {
        const suggestion = `${trimmed}-${i}`;
        const conflict = await require('../models').ReportStructure.findOne({
          where: { name: { [Op.iLike]: suggestion }, companyId }
        });
        if (!conflict) suggestions.push(suggestion);
      }
      return res.json({ isAvailable: false, suggestions });
    } catch (error) {
      console.error('Error validating template name:', error);
      res.status(500).json({ isAvailable: false, error: 'Internal server error.' });
    }
  }

  // --- PREVIEW TEMPLATE ---
  async previewTemplate(req, res) {
    try {
      const { wizardData, format = 'html', role = 'user', sampleData = {} } = req.body;
      // Validate input (basic)
      if (!wizardData) {
        return res.status(400).json({ error: 'wizardData is required' });
      }
      // Use ReportGenerationService to generate a preview (in-memory, not persisted)
      // For now, only HTML is supported
      const previewResult = await ReportGenerationService.generatePreview({
        wizardData,
        format,
        role,
        sampleData,
        user: req.user
      });
      if (format === 'html') {
        return res.json({ html: previewResult.html });
      } else if (format === 'pdf' || format === 'excel') {
        // For now, return a not implemented error
        return res.status(501).json({ error: 'Preview for this format is not implemented yet.' });
      } else {
        return res.status(400).json({ error: 'Unsupported format' });
      }
    } catch (error) {
      console.error('Error generating template preview:', error);
      res.status(500).json({ error: 'Failed to generate template preview' });
    }
  }

  // Helper methods
  async checkTemplateAccess(template, user, requiredLevel = 'read') {
    // Implementation would check user permissions based on company/module bindings
    // This is a simplified version
    if (user.role === 'super_admin') return true;
    if (template.companyId === user.companyId) return true;
    
    // Check bindings
    const { ReportTemplateBinding } = require('../models');
    const binding = await ReportTemplateBinding.findOne({
      where: {
        reportStructureId: template.id,
        [Op.or]: [
          { companyId: user.companyId },
          { bindingType: 'global' }
        ],
        isActive: true
      }
    });

    return binding !== null;
  }

  calculateChanges(previous, current) {
    const changes = {};
    
    for (const key in current) {
      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
        changes[key] = {
          from: previous[key],
          to: current[key]
        };
      }
    }
    
    return changes;
  }

  // Clone an existing report template
  async cloneTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await ReportStructure.findByPk(id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: Company, as: 'company', attributes: ['id', 'name'] }
        ]
      });
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      // Clone template fields, add (Copy) to name
      const cloned = await ReportStructure.create({
        ...template.toJSON(),
        name: template.name + ' (Copy)',
        createdBy: req.user.id,
        updatedBy: req.user.id,
        isActive: true
      });
      // Optionally clone bindings
      const { ReportTemplateBinding } = require('../models');
      const bindings = await ReportTemplateBinding.findAll({ where: { reportStructureId: id, isActive: true } });
      for (const binding of bindings) {
        await ReportTemplateBinding.create({
          ...binding.toJSON(),
          reportStructureId: cloned.id,
          createdBy: req.user.id
        });
      }
      // Create initial version for clone
      await cloned.createVersion({ action: 'cloned', data: cloned.toJSON() }, req.user.id);
      // Return the new template
      const completeCloned = await ReportStructure.findByPk(cloned.id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: Company, as: 'company', attributes: ['id', 'name'] }
        ]
      });
      res.status(201).json(completeCloned);
    } catch (error) {
      console.error('Error cloning template:', error);
      res.status(500).json({ error: 'Failed to clone template' });
    }
  }

  // List all versions of a report template
  async getTemplateVersions(req, res) {
    try {
      const { id } = req.params;
      const versions = await ReportTemplateVersion.findAll({
        where: { reportStructureId: id },
        order: [['version', 'DESC']]
      });
      res.json(versions);
    } catch (error) {
      console.error('Error getting template versions:', error);
      res.status(500).json({ error: 'Failed to get template versions' });
    }
  }

  // Restore a report template to a previous version
  async restoreVersion(req, res) {
    try {
      const { id, version } = req.params;
      const versionRecord = await ReportTemplateVersion.findOne({
        where: { reportStructureId: id, version },
      });
      if (!versionRecord) {
        return res.status(404).json({ error: 'Version not found' });
      }
      const template = await ReportStructure.findByPk(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      // Restore fields from version data
      await template.update({ ...versionRecord.data, updatedBy: req.user.id });
      // Create a new version entry for the restore
      await template.createVersion({
        action: 'restored',
        previous: template.toJSON(),
        current: versionRecord.data,
        changes: this.calculateChanges(template.toJSON(), versionRecord.data)
      }, req.user.id);
      res.json({ message: 'Template restored to version ' + version });
    } catch (error) {
      console.error('Error restoring template version:', error);
      res.status(500).json({ error: 'Failed to restore template version' });
    }
  }

  // List all report executions (history)
  async getExecutionHistory(req, res) {
    try {
      const { templateId } = req.query;
      const where = templateId ? { reportStructureId: templateId } : {};
      const executions = await ReportExecutionHistory.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });
      res.json(executions);
    } catch (error) {
      console.error('Error getting execution history:', error);
      res.status(500).json({ error: 'Failed to get execution history' });
    }
  }

  // Download a generated report file
  async downloadReport(req, res) {
    try {
      const { executionId } = req.params;
      const execution = await ReportExecutionHistory.findByPk(executionId);
      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }
      // Assume execution.outputFilePath contains the file path
      if (!execution.outputFilePath) {
        return res.status(404).json({ error: 'No file available for this execution' });
      }
      const path = require('path');
      const filePath = path.resolve(execution.outputFilePath);
      res.download(filePath);
    } catch (error) {
      console.error('Error downloading report:', error);
      res.status(500).json({ error: 'Failed to download report' });
    }
  }

  // Validate a wizard step
  async validateWizardStep(req, res) {
    try {
      const { stepId, stepData, allWizardData } = req.body;
      const validation = await ValidationService.validateWizardStep(stepId, stepData, allWizardData);
      res.json(validation);
    } catch (error) {
      console.error('Error validating wizard step:', error);
      res.status(500).json({ error: 'Failed to validate wizard step' });
    }
  }
}

module.exports = new ReportTemplateController(); 