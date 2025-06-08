const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directory.controller');
const { authenticateToken } = require('../middleware/auth');

// Directory routes
router.post('/', authenticateToken, directoryController.create);
router.get('/', authenticateToken, directoryController.findAll);
router.get('/:id', authenticateToken, directoryController.findOne);
router.put('/:id', authenticateToken, directoryController.update);
router.delete('/:id', authenticateToken, directoryController.delete);

module.exports = router; 