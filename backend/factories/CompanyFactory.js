const { Company } = require('../models');
const { Op } = require('sequelize');

class CompanyFactory {
  static async create(data) {
    return await Company.create(data);
  }

  static async findById(id) {
    return await Company.findByPk(id, {
      include: [
        {
          model: Company.sequelize.models.User,
          as: 'users',
          attributes: ['id']
        },
        {
          model: Company.sequelize.models.Receipt,
          as: 'receipts',
          attributes: ['id', 'total_amount']
        },
        {
          model: Company.sequelize.models.Module,
          as: 'modules',
          through: { attributes: [] }
        }
      ]
    });
  }

  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      include = []
    } = options;

    const offset = (page - 1) * limit;

    const where = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { admin_email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    // Get the count without includes for accurate pagination
    const count = await Company.count({ where });

    // Get the rows with includes
    const rows = await Company.findAll({
      where,
      include: [
        {
          model: Company.sequelize.models.User,
          as: 'users',
          attributes: ['id']
        },
        ...include
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      companies: rows,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit)
      }
    };
  }

  static async update(id, data) {
    const company = await Company.findByPk(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return await company.update(data);
  }

  static async delete(id) {
    const company = await Company.findByPk(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return await company.destroy();
  }

  static async getCompanyStats(id) {
    const company = await Company.findByPk(id, {
      include: [
        {
          model: Company.sequelize.models.User,
          as: 'users',
          attributes: ['id']
        },
        {
          model: Company.sequelize.models.Receipt,
          as: 'receipts',
          attributes: ['id', 'total_amount']
        },
        {
          model: Company.sequelize.models.Module,
          as: 'modules',
          through: { attributes: [] }
        }
      ]
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return {
      user_count: company.users.length,
      receipt_count: company.receipts.length,
      total_revenue: company.receipts.reduce((sum, receipt) => sum + receipt.total_amount, 0),
      modules: company.modules.map(module => module.name)
    };
  }

  static async getEmployees({ companyId, filters = {}, sort = 'created_at', order = 'DESC', page = 1, limit = 10 }) {
    const { User, UserRole } = require('../models');
    const where = { company_id: companyId };
    // Apply filters
    if (filters.firstname) {
      where.firstname = { [Op.iLike]: `%${filters.firstname}%` };
    }
    if (filters.lastname) {
      where.lastname = { [Op.iLike]: `%${filters.lastname}%` };
    }
    if (filters.email) {
      where.email = { [Op.iLike]: `%${filters.email}%` };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where,
      order: [[sort, order]],
      limit,
      offset,
      attributes: ['id', 'firstname', 'lastname', 'email', 'status', 'last_login', 'created_at'],
      include: [
        {
          model: UserRole,
          as: 'roles',
          attributes: ['id', 'name', 'description'],
          through: { attributes: [] }
        }
      ]
    });
    // Convert Sequelize instances to plain objects
    const employees = rows.map(user => {
      const plain = user.get({ plain: true });
      return {
        ...plain,
        roles: plain.roles || []
      };
    });
    return {
      employees,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit)
      }
    };
  }
}

module.exports = CompanyFactory; 