const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directory.controller');
const companyDirectoryController = require('../controllers/company-directory.controller');
const { authenticateToken } = require('../middleware/auth');

// Directory routes
router.post('/', authenticateToken, directoryController.create);
router.get('/', authenticateToken, directoryController.findAll);
router.get('/:id', authenticateToken, directoryController.findOne);
router.put('/:id', authenticateToken, directoryController.update);
router.delete('/:id', authenticateToken, directoryController.delete);

// Company directory routes
router.post('/company', authenticateToken, companyDirectoryController.create);
router.get('/company', authenticateToken, companyDirectoryController.findAll);
router.get('/company/:id', authenticateToken, companyDirectoryController.findOne);
router.put('/company/:id', authenticateToken, companyDirectoryController.update);
router.delete('/company/:id', authenticateToken, companyDirectoryController.delete);

module.exports = router; 