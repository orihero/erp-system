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
      const { directory_id, company_id, sortField, sortOrder = 'asc', groupBy } = req.query;
      // Parse filters from query (filters[field_id]=value)
      const filters = {};
      Object.keys(req.query).forEach((key) => {
        if (key.startsWith('filters[') && key.endsWith(']')) {
          const fieldId = key.slice(8, -1);
          filters[fieldId] = req.query[key];
        }
      });
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
      // Build include for DirectoryValue with filtering
      const valueInclude = {
        model: DirectoryValue,
        as: 'recordValues',
        include: [
          {
            model: DirectoryField,
            as: 'field'
          }
        ],
        required: false
      };
      // Filtering by field values
      if (Object.keys(filters).length > 0) {
        valueInclude.where = {
          [require('sequelize').Op.and]: Object.entries(filters).map(([field_id, value]) => ({
            field_id,
            value
          }))
        };
        valueInclude.required = true; // Only records matching filters
      }
      // Sorting by a field value
      let order = [['created_at', 'DESC']];
      let include = [valueInclude];
      if (sortField) {
        // Join DirectoryValue as a separate alias for sorting
        include.push({
          model: DirectoryValue,
          as: 'sortValue',
          required: false,
          where: { field_id: sortField },
        });
        order = [[{ model: DirectoryValue, as: 'sortValue' }, 'value', sortOrder]];
      }
      // Get all directory records for this company_directory
      const directoryRecords = await DirectoryRecord.findAll({
        where: { company_directory_id: companyDirectory.id },
        include,
        order
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
      // Grouping
      let grouped = null;
      if (groupBy) {
        grouped = {};
        for (const record of directoryRecords) {
          // Find the value for the groupBy field
          const valueObj = (record.recordValues || []).find(v => v.field_id === groupBy);
          const groupValue = valueObj ? valueObj.value : 'undefined';
          if (!grouped[groupValue]) grouped[groupValue] = [];
          grouped[groupValue].push(record);
        }
      }
      res.json({
        directory,
        companyDirectory: companyDirectoryObj,
        directoryRecords: grouped || directoryRecords,
        fields
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = directoryRecordController;
