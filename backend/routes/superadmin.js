const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const DirectoryFactory = require('../factories/DirectoryFactory');
const { Company } = require('../models');
const UserFactory = require('../factories/UserFactory');
const CompanyFactory = require('../factories/CompanyFactory');

// Apply authentication and role check to all routes
router.use(authenticateToken);
router.use(checkRole(['super_admin']));

// Create a new directory type
router.post('/directories', async (req, res) => {
  try {
    const { name, attributes } = req.body;

    // Validate input
    if (!name || !attributes || !Array.isArray(attributes)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Validate attributes
    for (const attr of attributes) {
      if (!attr.name || !attr.data_type) {
        return res.status(400).json({ error: 'Invalid attribute data' });
      }
      if (attr.data_type === 'relation' && !attr.relation_type_id) {
        return res.status(400).json({ error: 'Relation type ID required for relation attributes' });
      }
    }

    const directory = await DirectoryFactory.createDirectory({ name, attributes });
    res.status(201).json(directory);
  } catch (error) {
    console.error('Error creating directory:', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
});

// Assign directory to company
router.post('/companies/:company_id/directories/:directory_type_id', async (req, res) => {
  try {
    const { company_id, directory_type_id } = req.params;

    // Validate company exists
    const company = await Company.findByPk(company_id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const directory = await DirectoryFactory.assignDirectoryToCompany(company_id, directory_type_id);
    res.status(200).json(directory);
  } catch (error) {
    console.error('Error assigning directory to company:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to assign directory to company' });
  }
});

// Get all directories
router.get('/directories', async (req, res) => {
  try {
    const directories = await DirectoryFactory.getDirectoryById(null, {
      include: [{
        model: DirectoryAttribute,
        as: 'attributes'
      }]
    });
    res.json(directories);
  } catch (error) {
    console.error('Error fetching directories:', error);
    res.status(500).json({ error: 'Failed to fetch directories' });
  }
});

// Get all companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await CompanyFactory.findAll();
    res.json(companies);
  } catch (error) {
    console.error('Error getting companies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create company
router.post('/companies', async (req, res) => {
  try {
    const company = await CompanyFactory.create(req.body);
    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update company
router.put('/companies/:id', async (req, res) => {
  try {
    const company = await CompanyFactory.update(req.params.id, req.body);
    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete company
router.delete('/companies/:id', async (req, res) => {
  try {
    await CompanyFactory.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await UserFactory.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const user = await UserFactory.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const user = await UserFactory.update(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await UserFactory.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 