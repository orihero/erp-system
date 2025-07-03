const { Module, Company, CompanyModule } = require('../models');

module.exports = {
  async getAllModules(req, res) {
    try {
      const modules = await Module.findAll();
      res.json(modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ error: 'Failed to fetch modules: ' + error.message });
    }
  },

  async getCompanyModules(req, res) {
    try {
      const { companyId } = req.params;
      const companyModules = await CompanyModule.findAll({
        where: { company_id: companyId },
        include: [{
          model: Module,
          as: 'module',
          attributes: ['id', 'name', 'icon_name']
        }]
      });
      res.json(companyModules);
    } catch (error) {
      console.error('Error fetching company modules:', error);
      res.status(500).json({ error: 'Failed to fetch company modules: ' + error.message });
    }
  },

  async toggleCompanyModule(req, res) {
    try {
      const { companyId, moduleId } = req.params;
      const company = await Company.findByPk(companyId);
      const module = await Module.findByPk(moduleId);
      if (!company || !module) {
        return res.status(404).json({ error: 'Company or module not found.' });
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
      res.status(500).json({ error: 'Failed to toggle module: ' + error.message });
    }
  }
}; 