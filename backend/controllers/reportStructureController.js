const { ReportStructure } = require('../models');
const { ValidationError } = require('sequelize');

/**
 * Create a new report structure
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createReportStructure = async (req, res, next) => {
  try {
    const { name, description, univerData, reportStructureData } = req.body;

    // Validate required fields
    if (!name || !univerData || !reportStructureData) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, univerData, and reportStructureData are required'
      });
    }

    // Create the report structure
    const reportStructure = await ReportStructure.create({
      name,
      description,
      univerData,
      reportStructureData,
      createdBy: req.user?.id // Assuming user info is available in request
    });

    return res.status(201).json({
      status: 'success',
      data: reportStructure
    });

  } catch (error) {
    // Handle duplicate name error
    if (error instanceof ValidationError && error.errors?.[0]?.type === 'unique violation') {
      return res.status(400).json({
        status: 'error',
        message: 'A report structure with this name already exists'
      });
    }

    // Handle JSON validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data provided',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Get all report structures
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllReportStructures = async (req, res, next) => {
  try {
    const reportStructures = await ReportStructure.findAll({
      attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      status: 'success',
      data: reportStructures
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get a report structure by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getReportStructureById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid report structure ID format'
      });
    }

    const reportStructure = await ReportStructure.findByPk(id);

    if (!reportStructure) {
      return res.status(404).json({
        status: 'error',
        message: 'Report structure not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: reportStructure
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update a report structure
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateReportStructure = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, univerData, reportStructureData } = req.body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid report structure ID format'
      });
    }

    // Validate that at least one field is provided for update
    if (!name && !univerData && !reportStructureData && description === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields provided for update'
      });
    }

    // Find the report structure
    const reportStructure = await ReportStructure.findByPk(id);

    if (!reportStructure) {
      return res.status(404).json({
        status: 'error',
        message: 'Report structure not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (univerData) updateData.univerData = univerData;
    if (reportStructureData) updateData.reportStructureData = reportStructureData;

    // Update the report structure
    await reportStructure.update(updateData);

    // Fetch the updated record
    const updatedReportStructure = await ReportStructure.findByPk(id);

    return res.status(200).json({
      status: 'success',
      data: updatedReportStructure
    });

  } catch (error) {
    // Handle duplicate name error
    if (error instanceof ValidationError && error.errors?.[0]?.type === 'unique violation') {
      return res.status(400).json({
        status: 'error',
        message: 'A report structure with this name already exists'
      });
    }

    // Handle JSON validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data provided',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Delete a report structure
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteReportStructure = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid report structure ID format'
      });
    }

    // Find and delete the report structure
    const deletedCount = await ReportStructure.destroy({
      where: { id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Report structure not found'
      });
    }

    // Return 204 No Content on successful deletion
    return res.status(204).send();

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReportStructure,
  getAllReportStructures,
  getReportStructureById,
  updateReportStructure,
  deleteReportStructure
}; 