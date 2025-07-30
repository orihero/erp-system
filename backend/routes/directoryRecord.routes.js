const express = require('express');
const router = express.Router();
const directoryRecordController = require('../controllers/directoryRecord.controller');
const { authenticateUser } = require('../middleware/auth');

// Get directory records by directory
router.get('/directory/:companyDirectoryId', authenticateUser, directoryRecordController.getByDirectory);
router.get('/full-data', authenticateUser, directoryRecordController.getFullDirectoryData);

// Bulk delete by group
router.delete('/bulk-delete-by-group', authenticateUser, directoryRecordController.bulkDeleteByGroup);

// CRUD operations for individual records
router.get('/:id', authenticateUser, directoryRecordController.getOne);
router.post('/', authenticateUser, directoryRecordController.create);
router.put('/:id', authenticateUser, directoryRecordController.update);
router.delete('/:id', authenticateUser, directoryRecordController.delete);

module.exports = router;
