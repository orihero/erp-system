const express = require('express');
const router = express.Router();
const { Receipt } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/permissionMiddleware');

router.use(authenticateToken);

router.get('/overview', authorize('read', () => 'statistics'), async (req, res) => {
  try {
    const company_id = req.user.company_id;

    // Total receipts
    const totalReceipts = await Receipt.count({ where: { company_id } });

    // Total revenue
    const totalRevenue = await Receipt.sum('total_amount', { where: { company_id } });

    // Unique clients
    const uniqueClients = await Receipt.count({
      where: { company_id },
      distinct: true,
      col: 'client_entry_id'
    });

    // Top treatments (top 4 product_names by count)
    const topTreatmentsRaw = await Receipt.findAll({
      where: { company_id },
      attributes: [
        'product_name',
        [Receipt.sequelize.fn('COUNT', Receipt.sequelize.col('product_name')), 'count']
      ],
      group: ['product_name'],
      order: [[Receipt.sequelize.literal('count'), 'DESC']],
      limit: 4
    });
    const topTreatments = topTreatmentsRaw.map(row => ({
      product_name: row.product_name,
      count: parseInt(row.get('count'))
    }));

    res.json({
      totalReceipts,
      totalRevenue,
      uniqueClients,
      topTreatments
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router; 