const DirectoryRecordFactory = require('../factories/DirectoryRecordFactory');

const directoryRecordController = {
  // Create a new directory record
  create: async (req, res) => {
    try {
      const { company_directory_id, values } = req.body;
      const record = await DirectoryRecordFactory.createRecord(company_directory_id, values);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all records for a specific directory
  getByDirectory: async (req, res) => {
    try {
      const { companyDirectoryId } = req.params;
      const { page, limit, search } = req.query;
      const result = await DirectoryRecordFactory.getRecordsByDirectory(companyDirectoryId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || ''
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get a single directory record
  getOne: async (req, res) => {
    try {
      const record = await DirectoryRecordFactory.getRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: 'Directory Record not found' });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a directory record
  update: async (req, res) => {
    try {
      const { values } = req.body;
      const record = await DirectoryRecordFactory.updateRecord(req.params.id, values);
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a directory record
  delete: async (req, res) => {
    try {
      await DirectoryRecordFactory.deleteRecord(req.params.id);
      res.json({ message: 'Directory Record deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // New: Get all directory data, company_directory, and directory_records by directory_id and company_id
  getFullDirectoryData: async (req, res) => {
    try {
      const { directory_id, company_id } = req.query;
      if (!directory_id || !company_id) {
        return res.status(400).json({ message: 'directory_id and company_id are required' });
      }
      const { CompanyDirectory, Directory, DirectoryField, DirectoryRecord, DirectoryValue } = require('../models');
      // Find the company_directory
      const companyDirectory = await CompanyDirectory.findOne({
        where: { directory_id, company_id },
        include: [
          {
            model: Directory,
            as: 'directory',
            include: [{ model: DirectoryField, as: 'fields' }]
          }
        ]
      });
      if (!companyDirectory) {
        return res.status(404).json({ message: 'CompanyDirectory not found' });
      }
      // Get all directory records for this company_directory
      const directoryRecords = await DirectoryRecord.findAll({
        where: { company_directory_id: companyDirectory.id },
        include: [
          {
            model: DirectoryValue,
            as: 'recordValues',
            include: [
              {
                model: DirectoryField,
                as: 'field'
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      // Extract fields from directory and remove from directory and companyDirectory.directory
      const directory = companyDirectory.directory?.toJSON ? companyDirectory.directory.toJSON() : companyDirectory.directory;
      const fields = directory?.fields || [];
      if (directory) delete directory.fields;
      // Remove fields from companyDirectory.directory if present
      const companyDirectoryObj = companyDirectory.toJSON ? companyDirectory.toJSON() : companyDirectory;
      if (companyDirectoryObj.directory && companyDirectoryObj.directory.fields) {
        delete companyDirectoryObj.directory.fields;
      }
      res.json({
        directory,
        companyDirectory: companyDirectoryObj,
        directoryRecords,
        fields
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = directoryRecordController;
