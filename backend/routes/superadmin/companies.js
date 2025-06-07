const express = require('express');
const router = express.Router();
const CompanyFactory = require('../../factories/CompanyFactory');
const { authenticateToken, checkRole } = require('../../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);
router.use(checkRole(['super_admin']));

// Get companies with pagination
router.get('/', async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    
    console.log('GET /api/admin/companies headers:', req.headers);
    console.log('GET /api/admin/companies cookies:', req.cookies);
    console.log('GET /api/admin/companies req.user:', req.user);
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.log(`Super admin ${req.user.username} accessed companies list`);

    const result = await CompanyFactory.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || ''
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Create new company
router.post('/', async (req, res) => {
  try {
    const { name, admin_email } = req.body;

    // Validate input
    if (!name || !admin_email) {
      return res.status(400).json({ error: 'Name and admin email are required' });
    }

    console.log('POST /api/admin/companies headers:', req.headers);
    console.log('POST /api/admin/companies cookies:', req.cookies);
    console.log('POST /api/admin/companies req.user:', req.user);
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const company = await CompanyFactory.create({ name, admin_email });

    console.log(`Super admin ${req.user.username} created company: ${name}`);

    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Company name or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Get company details
router.get('/:company_id', async (req, res) => {
  try {
    const { company_id } = req.params;

    const company = await CompanyFactory.findById(company_id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const stats = await CompanyFactory.getCompanyStats(company_id);
    res.json({ ...company.toJSON(), ...stats });
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
});

// Update company
router.put('/:company_id', async (req, res) => {
  try {
    const { company_id } = req.params;
    const { name, admin_email } = req.body;

    if (!name && !admin_email) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }

    console.log('PUT /api/admin/companies headers:', req.headers);
    console.log('PUT /api/admin/companies cookies:', req.cookies);
    console.log('PUT /api/admin/companies req.user:', req.user);
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const company = await CompanyFactory.update(company_id, { name, admin_email });

    console.log(`Super admin ${req.user.username} updated company ${company_id}`);

    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    if (error.message === 'Company not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Company name or email already exists' });
    }
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Get employees for a company with filters, sorting, and pagination
router.get('/:company_id/employees', async (req, res) => {
  try {
    const { company_id } = req.params;
    const { page = 1, limit = 10, sort = 'created_at', order = 'DESC', ...filters } = req.query;
    const result = await CompanyFactory.getEmployees({
      companyId: company_id,
      filters,
      sort,
      order,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching company employees:', error);
    res.status(500).json({ error: 'Failed to fetch company employees' });
  }
});

module.exports = router; 