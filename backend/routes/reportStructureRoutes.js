const express = require('express');
const router = express.Router();
const { authenticateUser, checkRole } = require('../middleware/auth');
const { authorize } = require('../middleware/permissionMiddleware');
const { USER_ROLES, ENTITY_TYPES } = require('../utils/constants');
const { createReportStructure, getAllReportStructures, getReportStructureById, updateReportStructure, deleteReportStructure } = require('../controllers/reportStructureController');

// Get all report structures
router.get('/', authenticateUser, authorize('read', () => ENTITY_TYPES.REPORT_STRUCTURE), getAllReportStructures);

// Get a report structure by ID
router.get('/:id', authenticateUser, authorize('read', () => ENTITY_TYPES.REPORT_STRUCTURE), getReportStructureById);

// Create a new report structure
router.post('/', authenticateUser, authorize('create', () => ENTITY_TYPES.REPORT_STRUCTURE), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), createReportStructure);

// Update a report structure
router.put('/:id', authenticateUser, authorize('edit', () => ENTITY_TYPES.REPORT_STRUCTURE), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), updateReportStructure);

// Delete a report structure
router.delete('/:id', authenticateUser, authorize('delete', () => ENTITY_TYPES.REPORT_STRUCTURE), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), deleteReportStructure);

module.exports = router; 