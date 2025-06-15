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
  }
};

module.exports = directoryRecordController;
