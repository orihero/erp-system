const express = require('express');
const router = express.Router();
const { UserRole } = require('../models');

router.get('/', async (req, res) => {
  try {
    const roles = await UserRole.findAll({ attributes: ['id', 'name', 'description'] });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

module.exports = router; 