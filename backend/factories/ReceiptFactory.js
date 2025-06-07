const { Receipt, User, Company, DirectoryEntry } = require('../models');
const { Op } = require('sequelize');

class ReceiptFactory {
  static async createReceipt(data) {
    const {
      invoice_number,
      date,
      client_entry_id,
      product_name,
      quantity,
      unit_price,
      payment_status,
      cashier_id,
      company_id
    } = data;

    // Calculate total amount
    const total_amount = quantity * unit_price;

    // Validate calculations
    if (total_amount < 0) {
      throw new Error('Total amount cannot be negative');
    }

    // Create receipt in a transaction
    return await Receipt.sequelize.transaction(async (t) => {
      // Validate client entry exists and belongs to company
      const clientEntry = await DirectoryEntry.findOne({
        where: {
          id: client_entry_id,
          company_id
        },
        transaction: t
      });

      if (!clientEntry) {
        throw new Error('Client entry not found or does not belong to company');
      }

      // Validate cashier exists and belongs to company
      const cashier = await User.findOne({
        where: {
          id: cashier_id,
          company_id,
          role: 'cashier'
        },
        transaction: t
      });

      if (!cashier) {
        throw new Error('Cashier not found or does not belong to company');
      }

      // Create receipt
      const receipt = await Receipt.create({
        invoice_number,
        date,
        client_entry_id,
        product_name,
        quantity,
        unit_price,
        total_amount,
        payment_status,
        cashier_id,
        company_id
      }, { transaction: t });

      return receipt;
    });
  }

  static async getReceipts(options = {}) {
    const {
      page = 1,
      limit = 10,
      company_id,
      cashier_id,
      start_date,
      end_date,
      payment_status,
      search
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (company_id) {
      where.company_id = company_id;
    }

    if (cashier_id) {
      where.cashier_id = cashier_id;
    }

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Add search condition
    if (search) {
      where[Op.or] = [
        { invoice_number: { [Op.iLike]: `%${search}%` } },
        { product_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Receipt.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'cashier',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        },
        {
          model: DirectoryEntry,
          as: 'client',
          attributes: ['id']
        }
      ],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    return {
      receipts: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async getReceiptById(id, options = {}) {
    return await Receipt.findByPk(id, {
      include: [
        {
          model: User,
          as: 'cashier',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        },
        {
          model: DirectoryEntry,
          as: 'client',
          attributes: ['id']
        }
      ],
      ...options
    });
  }

  static async updateReceiptStatus(id, status, options = {}) {
    const receipt = await Receipt.findByPk(id, options);
    if (!receipt) {
      throw new Error('Receipt not found');
    }

    receipt.payment_status = status;
    await receipt.save(options);
    return receipt;
  }
}

module.exports = ReceiptFactory; 