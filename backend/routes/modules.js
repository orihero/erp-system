const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const modulesController = require('../controllers/modules.controller');

// Apply authentication to all routes
router.use(authenticateToken);

// Get all available modules
router.get('/', modulesController.getAllModules);

// Get modules for a specific company
router.get('/company/:companyId', modulesController.getCompanyModules);

// Toggle module for a company
router.post('/company/:companyId/toggle/:moduleId', modulesController.toggleCompanyModule);

module.exports = router; 