const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { createReportStructure, getAllReportStructures, getReportStructureById, updateReportStructure, deleteReportStructure } = require('../controllers/reportStructureController');

// Get all report structures
router.get('/', authenticateToken, getAllReportStructures);

// Get a report structure by ID
router.get('/:id', authenticateToken, getReportStructureById);

// Create a new report structure
router.post('/', authenticateToken, createReportStructure);

// Update a report structure
router.put('/:id', authenticateToken, updateReportStructure);

// Delete a report structure
router.delete('/:id', authenticateToken, deleteReportStructure);

module.exports = router; 