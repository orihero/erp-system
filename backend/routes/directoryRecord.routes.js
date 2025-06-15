const express = require('express');
const router = express.Router();
const directoryRecordController = require('../controllers/directoryRecord.controller');
const { authenticateToken } = require('../middleware/auth');

// Directory record routes
router.post('/', authenticateToken, directoryRecordController.create);
router.get('/directory/:companyDirectoryId', authenticateToken, directoryRecordController.getByDirectory);
router.get('/:id', authenticateToken, directoryRecordController.getOne);
router.put('/:id', authenticateToken, directoryRecordController.update);
router.delete('/:id', authenticateToken, directoryRecordController.delete);

module.exports = router;
