const express = require('express');
const router = express.Router();
const cascadingController = require('../controllers/cascading.controller');
const { authenticateUser } = require('../middleware/auth');

// Get cascading configuration for a specific field value
router.get('/config', authenticateUser, cascadingController.getCascadingConfig);

// Get filtered directory records based on parent field value
router.get('/filtered-records', authenticateUser, cascadingController.getFilteredRecords);

// Get all cascading directories
router.get('/directories', authenticateUser, cascadingController.getCascadingDirectories);

// Update cascading configuration for a directory record
router.put('/config/:recordId', authenticateUser, cascadingController.updateCascadingConfig);

// Validate cascading selection
router.post('/validate', authenticateUser, cascadingController.validateCascadingSelection);

// Save cascading field values
router.post('/save-values', authenticateUser, cascadingController.saveCascadingValues);

// Get cascading field values for a record
router.get('/values/:recordId', authenticateUser, cascadingController.getCascadingValues);

module.exports = router; 