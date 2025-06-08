const express = require('express');
const router = express.Router();
const companyDirectoryController = require('../controllers/company-directory.controller');
const { authenticateToken } = require('../middleware/auth');

// Company directory routes
router.post('/', authenticateToken, companyDirectoryController.create);
router.get('/', authenticateToken, companyDirectoryController.findAll);
router.get('/:id', authenticateToken, companyDirectoryController.findOne);
router.put('/:id', authenticateToken, companyDirectoryController.update);
router.delete('/:id', authenticateToken, companyDirectoryController.delete);

module.exports = router; 