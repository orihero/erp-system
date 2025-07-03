const express = require('express');
const router = express.Router();
const { Receipt } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/permissionMiddleware');
const statisticsController = require('../controllers/statistics.controller');

router.use(authenticateToken);

router.get('/overview', authorize('read', () => 'statistics'), statisticsController.getOverview);

module.exports = router; 