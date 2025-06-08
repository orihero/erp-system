const { CompanyDirectory, Directory, DirectoryField, DirectoryValue } = require('../models');
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
  findAll: async (req, res) => {
    try {
      const { company_id, search } = req.query;
      const where = {};

      if (company_id) {
        where.company_id = company_id;
      }

      if (search) {
        where['$directory.name$'] = {
          [Op.iLike]: `%${search}%`
        };
      }

      const companyDirectories = await CompanyDirectory.findAll({
        where,
        include: [
          {
            model: Directory,
            as: 'directory',
            include: [{
              model: DirectoryField,
              as: 'fields'
            }]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json(companyDirectories);
    } catch (error) {
      console.error('Error in findAll:', error);
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
  }
};

module.exports = companyDirectoryController; 