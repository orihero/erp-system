const express = require('express');
const router = express.Router();
const companyDirectoryController = require('../controllers/company-directory.controller');
const { authenticateToken } = require('../middleware/auth');

// Company directory routes
router.post('/', authenticateToken, companyDirectoryController.create);
router.get('/', authenticateToken, companyDirectoryController.getAll);
router.get('/:id', authenticateToken, companyDirectoryController.findOne);
router.put('/:id', authenticateToken, companyDirectoryController.update);
router.delete('/:id', authenticateToken, companyDirectoryController.delete);
router.post('/bulk-bind', authenticateToken, companyDirectoryController.bulkBind);

module.exports = router; 