const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directory.controller');
const { authenticateUser, checkRole } = require('../middleware/auth');
const { authorize } = require('../middleware/permissionMiddleware');
const { USER_ROLES, ENTITY_TYPES } = require('../utils/constants');

 // Directory routes
router.post('/', authenticateUser, authorize('create', () => ENTITY_TYPES.DIRECTORY), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), directoryController.create);
router.get('/', authenticateUser, authorize(null, null, null, null, 'directories.view'), directoryController.findAll);
router.get('/:id', authenticateUser, authorize('read', () => ENTITY_TYPES.DIRECTORY), directoryController.findOne);
router.put('/:id', authenticateUser, authorize('edit', () => ENTITY_TYPES.DIRECTORY), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), directoryController.update);
router.delete('/:id', authenticateUser, authorize('delete', () => ENTITY_TYPES.DIRECTORY), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), directoryController.delete);
router.get('/:id/fields', authenticateUser, authorize('read', () => ENTITY_TYPES.DIRECTORY), directoryController.getFields);
router.put('/:id/metadata', authenticateUser, authorize('edit', () => ENTITY_TYPES.DIRECTORY), checkRole([USER_ROLES.SUPER_ADMIN]), directoryController.updateMetadata);

module.exports = router;
