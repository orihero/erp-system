const express = require('express');
const router = express.Router();
const companyDirectoryController = require('../controllers/company-directory.controller');
const { authenticateUser, checkRole } = require('../middleware/auth');
const { authorize } = require('../middleware/permissionMiddleware');
const { PERMISSION_TYPES, USER_ROLES, ENTITY_TYPES } = require('../utils/constants');

// Company directory routes
router.post('/', authenticateUser, authorize(PERMISSION_TYPES.CREATE, () => ENTITY_TYPES.COMPANY_DIRECTORY), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), companyDirectoryController.create);
router.get('/', authenticateUser, authorize(PERMISSION_TYPES.READ, req => req.query.module_id), companyDirectoryController.getAll);
router.get('/:id', authenticateUser, authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.COMPANY_DIRECTORY), companyDirectoryController.findOne);
router.put('/:id', authenticateUser, authorize(PERMISSION_TYPES.EDIT, () => ENTITY_TYPES.COMPANY_DIRECTORY), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), companyDirectoryController.update);
router.delete('/:id', authenticateUser, authorize(PERMISSION_TYPES.DELETE, () => ENTITY_TYPES.COMPANY_DIRECTORY), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), companyDirectoryController.delete);
router.post('/bulk-bind', authenticateUser, authorize(PERMISSION_TYPES.EDIT, () => ENTITY_TYPES.COMPANY_DIRECTORY), checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), companyDirectoryController.bulkBind);

module.exports = router; 