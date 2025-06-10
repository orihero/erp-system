const express = require('express');
const router = express.Router();
const { createReportStructure, getAllReportStructures, getReportStructureById, updateReportStructure, deleteReportStructure } = require('../controllers/reportStructureController');
const { authenticate } = require('../middleware/auth');

// Get all report structures
router.get('/', authenticate, getAllReportStructures);

// Get a report structure by ID
router.get('/:id', authenticate, getReportStructureById);

// Create a new report structure
router.post('/', authenticate, createReportStructure);

// Update a report structure
router.put('/:id', authenticate, updateReportStructure);

// Delete a report structure
router.delete('/:id', authenticate, deleteReportStructure);

module.exports = router; 