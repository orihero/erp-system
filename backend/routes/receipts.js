const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, authorizeCompanyAccess } = require('../middleware/auth');
const ReceiptFactory = require('../factories/ReceiptFactory');

// Apply authentication to all routes
router.use(authenticateToken);

// Create receipt
router.post('/', checkRole(['cashier', 'admin']), async (req, res) => {
  try {
    const {
      invoice_number,
      date,
      client_entry_id,
      product_name,
      quantity,
      unit_price,
      payment_status
    } = req.body;

    // Validate required fields
    if (!invoice_number || !date || !client_entry_id || !product_name || 
        quantity === undefined || unit_price === undefined || !payment_status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate numeric fields
    if (isNaN(quantity) || isNaN(unit_price)) {
      return res.status(400).json({ error: 'Quantity and unit price must be numbers' });
    }

    // Validate payment status
    const validStatuses = ['pending', 'paid', 'cancelled'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const receipt = await ReceiptFactory.createReceipt({
      invoice_number,
      date,
      client_entry_id,
      product_name,
      quantity,
      unit_price,
      payment_status,
      cashier_id: req.user.id,
      company_id: req.user.company_id
    });

    res.status(201).json(receipt);
  } catch (error) {
    console.error('Error creating receipt:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('cannot be negative')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create receipt' });
  }
});

// Get all receipts
router.get('/', checkRole(['cashier', 'admin', 'super_admin']), async (req, res) => {
  try {
    const {
      page,
      limit,
      cashier_id,
      start_date,
      end_date,
      payment_status,
      search
    } = req.query;

    // Set company_id based on role
    let company_id = req.user.company_id;
    if (req.user.role === 'super_admin' && req.query.company_id) {
      company_id = req.query.company_id;
    }

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      company_id,
      cashier_id,
      start_date,
      end_date,
      payment_status,
      search
    };

    const result = await ReceiptFactory.getReceipts(options);
    res.json(result);
  } catch (error) {
    console.error('Error getting receipts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get receipt by ID
router.get('/:id', checkRole(['cashier', 'admin', 'super_admin']), async (req, res) => {
  try {
    const receipt = await ReceiptFactory.getReceiptById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // Check company access
    if (req.user.role !== 'super_admin' && receipt.company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(receipt);
  } catch (error) {
    console.error('Error getting receipt:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update receipt status
router.patch('/:id/status', checkRole(['cashier', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;

    // Validate payment status
    const validStatuses = ['pending', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const receipt = await ReceiptFactory.updateReceiptStatus(req.params.id, status);
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Check company access
    if (receipt.company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(receipt);
  } catch (error) {
    console.error('Error updating receipt status:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update receipt status' });
  }
});

module.exports = router; 