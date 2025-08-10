const { ReportTemplateBinding, Company, Module, User } = require('../models');
const { Op } = require('sequelize');

class ReportBindingController {

  async getTemplateBindings(req, res) {
    try {
      const { id } = req.params;

      const bindings = await ReportTemplateBinding.findAll({
        where: {
          reportStructureId: id,
          isActive: true
        },
        include: [
          { model: Company, as: 'company', attributes: ['id', 'name'] },
          { model: Module, as: 'module', attributes: ['id', 'name'] },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(bindings);
    } catch (error) {
      console.error('Error getting template bindings:', error);
      res.status(500).json({ error: 'Failed to get template bindings' });
    }
  }

  async createBinding(req, res) {
    try {
      const { id } = req.params;
      const {
        companyId,
        moduleId,
        bindingType,
        accessLevel,
        inheritanceEnabled,
        customizationAllowed
      } = req.body;

      // Validate binding type and required fields
      if (bindingType === 'company' && !companyId) {
        return res.status(400).json({ error: 'Company ID is required for company binding' });
      }
      
      if (bindingType === 'module' && !moduleId) {
        return res.status(400).json({ error: 'Module ID is required for module binding' });
      }
      
      if (bindingType === 'company_module' && (!companyId || !moduleId)) {
        return res.status(400).json({ error: 'Both Company ID and Module ID are required for company-module binding' });
      }

      // Check for existing binding
      const existingBinding = await ReportTemplateBinding.findOne({
        where: {
          reportStructureId: id,
          companyId: companyId || null,
          moduleId: moduleId || null,
          isActive: true
        }
      });

      if (existingBinding) {
        return res.status(409).json({ error: 'Binding already exists for this combination' });
      }

      // Create binding
      const binding = await ReportTemplateBinding.create({
        reportStructureId: id,
        companyId: companyId || null,
        moduleId: moduleId || null,
        bindingType,
        accessLevel: accessLevel || 'execute',
        inheritanceEnabled: inheritanceEnabled || false,
        customizationAllowed: customizationAllowed !== false,
        createdBy: req.user.id
      });

      // Fetch complete binding with associations
      const completeBinding = await ReportTemplateBinding.findByPk(binding.id, {
        include: [
          { model: Company, as: 'company', attributes: ['id', 'name'] },
          { model: Module, as: 'module', attributes: ['id', 'name'] },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ]
      });

      res.status(201).json(completeBinding);
    } catch (error) {
      console.error('Error creating binding:', error);
      res.status(500).json({ error: 'Failed to create binding' });
    }
  }

  async updateBinding(req, res) {
    try {
      const { id, bindingId } = req.params;
      const updateData = req.body;

      const binding = await ReportTemplateBinding.findOne({
        where: {
          id: bindingId,
          reportStructureId: id
        }
      });

      if (!binding) {
        return res.status(404).json({ error: 'Binding not found' });
      }

      // Update binding
      await binding.update(updateData);

      // Fetch updated binding with associations
      const updatedBinding = await ReportTemplateBinding.findByPk(bindingId, {
        include: [
          { model: Company, as: 'company', attributes: ['id', 'name'] },
          { model: Module, as: 'module', attributes: ['id', 'name'] },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ]
      });

      res.json(updatedBinding);
    } catch (error) {
      console.error('Error updating binding:', error);
      res.status(500).json({ error: 'Failed to update binding' });
    }
  }

  async deleteBinding(req, res) {
    try {
      const { id, bindingId } = req.params;

      const binding = await ReportTemplateBinding.findOne({
        where: {
          id: bindingId,
          reportStructureId: id
        }
      });

      if (!binding) {
        return res.status(404).json({ error: 'Binding not found' });
      }

      // Soft delete by setting isActive to false
      await binding.update({ isActive: false });

      res.json({ message: 'Binding deleted successfully' });
    } catch (error) {
      console.error('Error deleting binding:', error);
      res.status(500).json({ error: 'Failed to delete binding' });
    }
  }

  async getAvailableCompanies(req, res) {
    try {
      // Get companies accessible to the current user
      const companies = await Company.findAll({
        attributes: ['id', 'name', 'description'],
        where: {
          isActive: true
        },
        order: [['name', 'ASC']]
      });

      res.json(companies);
    } catch (error) {
      console.error('Error getting available companies:', error);
      res.status(500).json({ error: 'Failed to get available companies' });
    }
  }

  async getAvailableModules(req, res) {
    try {
      // Get modules accessible to the current user
      const modules = await Module.findAll({
        attributes: ['id', 'name', 'description', 'category'],
        where: {
          isActive: true
        },
        order: [['category', 'ASC'], ['name', 'ASC']]
      });

      res.json(modules);
    } catch (error) {
      console.error('Error getting available modules:', error);
      res.status(500).json({ error: 'Failed to get available modules' });
    }
  }
}

module.exports = new ReportBindingController(); 