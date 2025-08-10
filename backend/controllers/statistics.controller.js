const { Receipt } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async getOverview(req, res) {
    try {
      const company_id = req.user.company_id;
      const totalReceipts = await Receipt.count({ where: { company_id } });
      const totalRevenue = await Receipt.sum('total_amount', { where: { company_id } });
      const uniqueClients = await Receipt.count({
        where: { company_id },
        distinct: true,
        col: 'client_entry_id'
      });
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
      res.status(500).json({ error: 'Failed to fetch statistics: ' + error.message });
    }
  }
}; 