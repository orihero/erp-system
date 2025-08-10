  const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const { authorize } = require('../middleware/permissionMiddleware');
const receiptsController = require('../controllers/receipts.controller');

// Apply authentication to all routes
router.use(authenticateToken);

// Create receipt
router.post('/', authorize('create', () => 'receipt'), checkRole(['cashier', 'admin']), receiptsController.createReceipt);

// Get all receipts
router.get('/', authorize('read', () => 'receipt'), checkRole(['cashier', 'admin', 'super_admin']), receiptsController.getAllReceipts);

// Get receipt by ID
router.get('/:id', authorize('read', () => 'receipt'), checkRole(['cashier', 'admin', 'super_admin']), receiptsController.getReceiptById);

// Update receipt status
router.patch('/:id/status', authorize('edit', () => 'receipt'), checkRole(['cashier', 'admin']), receiptsController.updateReceiptStatus);

module.exports = router; 