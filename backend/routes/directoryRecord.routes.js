const express = require('express');
const router = express.Router();
const directoryRecordController = require('../controllers/directoryRecord.controller');
const { authenticateUser } = require('../middleware/auth');

// Directory record routes (open to any authenticated user)
router.post('/', authenticateUser, directoryRecordController.create);
router.get('/directory/:companyDirectoryId', authenticateUser, directoryRecordController.getByDirectory);
router.get('/full-data', authenticateUser, directoryRecordController.getFullDirectoryData);
router.get('/:id', authenticateUser, directoryRecordController.getOne);
router.put('/:id', authenticateUser, directoryRecordController.update);
router.delete('/:id', authenticateUser, directoryRecordController.delete);

module.exports = router;
