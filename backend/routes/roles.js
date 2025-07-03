const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const rolesController = require('../controllers/roles.controller');

router.get('/', rolesController.getAllRoles);

router.post('/', authenticateToken, checkRole(["super_admin", "admin"]), rolesController.createRole);

router.put('/:id', authenticateToken, checkRole(["super_admin", "admin"]), rolesController.updateRole);

router.delete('/:id', authenticateToken, checkRole(["super_admin", "admin"]), rolesController.deleteRole);

module.exports = router; 