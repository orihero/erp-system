const { CompanyDirectory, Directory, DirectoryField, DirectoryValue, CompanyModule } = require('../models');
const { Op } = require('sequelize');

const companyDirectoryController = {
  // Create a new company directory
  create: async (req, res) => {
    try {
      const { company_id, directory_id } = req.body;
      
      const companyDirectory = await CompanyDirectory.create({
        company_id,
        directory_id
      });

      const createdCompanyDirectory = await CompanyDirectory.findByPk(companyDirectory.id, {
        include: [
          {
            model: Directory,
            as: 'directory',
            include: [{
              model: DirectoryField,
              as: 'fields'
            }]
          }
        ]
      });

      res.status(201).json(createdCompanyDirectory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all company directories
  getAll: async (req, res) => {
    try {
      const { company_id, search, module_id } = req.query;
      const where = {};

      if (company_id) {
        where.company_id = company_id;
      }

      if (module_id) {
        where.module_id = module_id;
      }

      if (search) {
        where[Op.or] = [
          { '$directory.name$': { [Op.iLike]: `%${search}%` } }
        ];
      }

      const companyDirectories = await CompanyDirectory.findAll({
        where,
include: [
  {
    model: Directory,
    as: 'directory',
    attributes: ['id', 'name', 'icon_name']
  }
],
        order: [['created_at', 'DESC']]
      });

      res.json(companyDirectories);
    } catch (error) {
      console.error('Error fetching company directories:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Get a single company directory
  findOne: async (req, res) => {
    try {
      const companyDirectory = await CompanyDirectory.findByPk(req.params.id, {
        include: [
          {
            model: Directory,
            as: 'directory',
            include: [{
              model: DirectoryField,
              as: 'fields'
            }]
          }
        ]
      });

      if (!companyDirectory) {
        return res.status(404).json({ message: 'Company directory not found' });
      }

      res.json(companyDirectory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a company directory
  update: async (req, res) => {
    try {
      const companyDirectory = await CompanyDirectory.findByPk(req.params.id);

      if (!companyDirectory) {
        return res.status(404).json({ message: 'Company directory not found' });
      }

      const updatedCompanyDirectory = await CompanyDirectory.findByPk(companyDirectory.id, {
        include: [
          {
            model: Directory,
            as: 'directory',
            include: [{
              model: DirectoryField,
              as: 'fields'
            }]
          }
        ]
      });

      res.json(updatedCompanyDirectory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a company directory
  delete: async (req, res) => {
    try {
      const companyDirectory = await CompanyDirectory.findByPk(req.params.id);

      if (!companyDirectory) {
        return res.status(404).json({ message: 'Company directory not found' });
      }

      // Delete all directory values associated with this company directory
      await DirectoryValue.destroy({
        where: {
          company_directory_id: companyDirectory.id
        }
      });

      // Now delete the company directory
      await companyDirectory.destroy();
      res.json({ message: 'Company directory deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Bulk bind directories to a module for a company
  bulkBind: async (req, res) => {
    try {
      const { company_id, module_id, directory_ids } = req.body;
      console.log('[bulkBind] Input:', { company_id, module_id, directory_ids });
      
      if (!company_id || !module_id || !Array.isArray(directory_ids)) {
        console.log('[bulkBind] Invalid input');
        return res.status(400).json({ message: 'company_id, module_id, and directory_ids are required.' });
      }

      // Verify that the module_id exists
      const companyModule = await CompanyModule.findOne({
        where: {
          company_id,
          id: module_id
        }
      });

      if (!companyModule) {
        console.log('[bulkBind] Invalid module_id');
        return res.status(400).json({
          message: 'Invalid module_id or it does not belong to the specified company'
        });
      }

      // Use the actual module_id from the found record
      const actualModuleId = companyModule.id;

      const results = [];
      for (const directory_id of directory_ids) {
        try {
          // Check if the binding already exists
          const existing = await CompanyDirectory.findOne({
            where: { company_id, module_id: actualModuleId, directory_id }
          });

          if (existing) {
            console.log(`[bulkBind] Already exists:`, { company_id, module_id: actualModuleId, directory_id });
            results.push({ directory_id, status: 'exists' });
            continue;
          }

          // Create new binding
          const companyDirectory = await CompanyDirectory.create({
            company_id,
            module_id: actualModuleId,
            directory_id
          });

          results.push({ directory_id, status: 'created', id: companyDirectory.id });
        } catch (error) {
          console.error(`[bulkBind] Error processing directory ${directory_id}:`, error);
          results.push({ directory_id, status: 'error', error: error.message });
        }
      }

      res.json({ message: 'Bulk bind completed', results });
    } catch (error) {
      console.error('[bulkBind] Error:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = companyDirectoryController;
