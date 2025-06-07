const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../../middleware/auth');
const { Module, Company, CompanyModule } = require('../../models');

// Apply authentication to all routes
router.use(authenticateToken);

// Get all available modules
router.get('/', async (req, res) => {
  try {
    const modules = await Module.findAll();
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get modules for a specific company
router.get('/company/:companyId', async (req, res) => {
  try {
    const companyModules = await CompanyModule.findAll({
      where: { company_id: req.params.companyId },
      include: [{
        model: Module,
        as: 'module',
        attributes: ['id', 'name', 'icon_name']
      }]
    });

    const modules = companyModules.map(cm => ({
      ...cm.module.toJSON(),
      is_enabled: cm.is_enabled
    }));

    res.json(modules);
  } catch (error) {
    console.error('Error fetching company modules:', error);
    res.status(500).json({ error: 'Failed to fetch company modules' });
  }
});

// Toggle module for a company
router.post('/company/:companyId/toggle/:moduleId', async (req, res) => {
  try {
    const { companyId, moduleId } = req.params;
    const company = await Company.findByPk(companyId);
    const module = await Module.findByPk(moduleId);

    if (!company || !module) {
      return res.status(404).json({ error: 'Company or module not found' });
    }

    const [companyModule, created] = await CompanyModule.findOrCreate({
      where: {
        company_id: companyId,
        module_id: moduleId
      },
      defaults: {
        is_enabled: true
      }
    });

    if (!created) {
      companyModule.is_enabled = !companyModule.is_enabled;
      await companyModule.save();
    }

    res.json({ 
      message: companyModule.is_enabled ? 'Module enabled' : 'Module disabled',
      is_enabled: companyModule.is_enabled
    });
  } catch (error) {
    console.error('Error toggling module:', error);
    res.status(500).json({ error: 'Failed to toggle module' });
  }
});

module.exports = router; 