const express = require('express');
const router = express.Router();
const directoryRecordController = require('../controllers/directoryRecord.controller');
const { authenticateUser, checkRole } = require('../middleware/auth');
const { authorize } = require('../middleware/permissionMiddleware');
const { USER_ROLES, ENTITY_TYPES } = require('../utils/constants');

// Directory record routes
router.post('/', authenticateUser, authorize('create', () => ENTITY_TYPES.DIRECTORY_RECORD), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), directoryRecordController.create);
router.get('/directory/:companyDirectoryId', authenticateUser, authorize('read', () => ENTITY_TYPES.DIRECTORY_RECORD), directoryRecordController.getByDirectory);
router.get('/:id', authenticateUser, authorize('read', () => ENTITY_TYPES.DIRECTORY_RECORD), directoryRecordController.getOne);
router.put('/:id', authenticateUser, authorize('edit', () => ENTITY_TYPES.DIRECTORY_RECORD), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), directoryRecordController.update);
router.delete('/:id', authenticateUser, authorize('delete', () => ENTITY_TYPES.DIRECTORY_RECORD), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), directoryRecordController.delete);

module.exports = router;
