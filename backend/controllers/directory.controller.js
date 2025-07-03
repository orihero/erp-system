const { Directory, DirectoryField, CompanyDirectory } = require('../models');
const { Op } = require('sequelize');

const directoryController = {
  // Create a new directory
  create: async (req, res) => {
    try {
      const { name, icon_name, directory_type, fields } = req.body;
      
      const directory = await Directory.create({
        name,
        icon_name,
        directory_type
      });

      if (fields && fields.length > 0) {
        await Promise.all(fields.map(field => 
          DirectoryField.create({
            ...field,
            directory_id: directory.id
          })
        ));
      }

      const createdDirectory = await Directory.findByPk(directory.id, {
        include: [{
          model: DirectoryField,
          as: 'fields'
        }]
      });

      res.status(201).json(createdDirectory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all directories
  findAll: async (req, res) => {
    try {
      const { search } = req.query;
      const where = search ? {
        name: {
          [Op.iLike]: `%${search}%`
        }
      } : {};

      const directories = await Directory.findAll({
        where,
        include: [{
          model: DirectoryField,
          as: 'fields'
        }],
        order: [['created_at', 'DESC']]
      });

      res.json(directories);
    } catch (error) {
      console.error('Error in findAll:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: error.message });
    }
  },

  // Get a single directory
  findOne: async (req, res) => {
    try {
      const directory = await Directory.findByPk(req.params.id, {
        include: [{
          model: DirectoryField,
          as: 'fields'
        }]
      });

      if (!directory) {
        return res.status(404).json({ message: 'Directory not found' });
      }

      res.json(directory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a directory
  update: async (req, res) => {
    try {
      const { name, icon_name, fields } = req.body;
      const directory = await Directory.findByPk(req.params.id);

      if (!directory) {
        return res.status(404).json({ message: 'Directory not found' });
      }

      await directory.update({
        name,
        icon_name,
        metadata: req.body.metadata
      });

      if (fields) {
        // Delete existing fields
        await DirectoryField.destroy({
          where: { directory_id: directory.id }
        });

        // Create new fields
        await Promise.all(fields.map(field =>
          DirectoryField.create({
            ...field,
            directory_id: directory.id
          })
        ));
      }

      const updatedDirectory = await Directory.findByPk(directory.id, {
        include: [{
          model: DirectoryField,
          as: 'fields'
        }]
      });

      res.json(updatedDirectory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a directory
  delete: async (req, res) => {
    try {
      const directory = await Directory.findByPk(req.params.id);

      if (!directory) {
        return res.status(404).json({ message: 'Directory not found' });
      }

      // Check if directory is used in any company
      const companyDirectories = await CompanyDirectory.count({
        where: { directory_id: directory.id }
      });

      if (companyDirectories > 0) {
        return res.status(400).json({
          message: 'Cannot delete directory as it is being used by companies'
        });
      }

      await directory.destroy();
      res.json({ message: 'Directory deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get fields of a directory
  getFields: async (req, res) => {
    try {
      const directory = await Directory.findByPk(req.params.id, {
        include: [{
          model: DirectoryField,
          as: 'fields'
        }]
      });

      if (!directory) {
        return res.status(404).json({ message: 'Directory not found' });
      }

      res.json(directory.fields);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = directoryController;
