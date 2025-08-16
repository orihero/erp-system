const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { User, UserRole, UserRoleAssignment, Company, Permission, RolePermission } = require('../models');
const bcrypt = require('bcrypt');

class UserFactory {
  constructor(models) {
    this.User = models.User;
  }

  async create(data) {
    try {
      const user = await this.User.create(data);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    const defaultInclude = [
      {
        model: this.User.sequelize.models.Company,
        as: 'company',
        attributes: ["id", "name"],
      },
    ];

    return await this.User.findByPk(id, {
      include: options.include || defaultInclude,
      attributes: options.attributes || { exclude: ["password"] },
    });
  }

  static async findByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: Company,
            as: 'company'
          },
          {
            model: UserRole,
            as: 'roles',
            through: { attributes: ['company_id'] }
          }
        ]
      });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      company_id = null,
      role = null,
      include = [],
    } = options;

    const offset = (page - 1) * limit;

    const where = {};

    // Only add search conditions if search is not empty
    if (search && search.trim()) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search.trim()}%` } },
        { firstname: { [Op.iLike]: `%${search.trim()}%` } },
        { lastname: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    // Only add role if it's provided
    if (role) {
      where.role = role;
    }

    // Always include company name
    const companyInclude = {
      model: this.User.sequelize.models.Company,
      as: 'company',
      attributes: ["id", "name"],
    };

    // Always include roles
    const rolesInclude = {
      model: this.User.sequelize.models.UserRole,
      as: 'roles',
      through: { attributes: [] }
    };

    const { count, rows } = await this.User.findAndCountAll({
      where,
      include: [companyInclude, rolesInclude, ...include],
      limit,
      offset,
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["password"] },
    });

    // Map users to include roles as an array of role names
    const usersWithRoles = rows.map(user => {
      const userJson = user.toJSON();
      return {
        ...userJson,
        roles: userJson.roles ? userJson.roles.map(r => r.name) : []
      };
    });

    return {
      users: usersWithRoles,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  async update(id, data) {
    try {
      const user = await this.User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }
      await user.update(data);
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const user = await this.User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }
      await user.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async authenticate(email, password) {
    try {
      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: Company,
            as: 'company'
          }
        ]
      });

      if (!user) {
        return null;
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return null;
      }

      // Update last login
      user.last_login = new Date();
      await user.save();

      return user;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  async changePassword(id, currentPassword, newPassword) {
    const user = await this.User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    return await user.update({ password: newPassword });
  }

  async updateStatus(id, status) {
    const user = await this.User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    return await user.update({ status });
  }

  static async assignRole(userId, roleId, companyId) {
    try {
      const assignment = await UserRoleAssignment.create({
        user_id: userId,
        role_id: roleId,
        company_id: companyId
      });
      return assignment;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  static async removeRole(userId, roleId, companyId) {
    try {
      const assignment = await UserRoleAssignment.findOne({
        where: {
          user_id: userId,
          role_id: roleId,
          company_id: companyId
        }
      });

      if (assignment) {
        await assignment.destroy();
      }

      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  }

  static async getUserRoles(userId, companyId = null) {
    try {
      const { User, UserRole, Permission, RolePermission } = require('../models');
      
      // Find user with roles using the same pattern as CompanyFactory.getEmployees
      const where = { id: userId };
      if (companyId) {
        where.company_id = companyId;
      }
      
      const user = await User.findOne({
        where,
        include: [
          {
            model: UserRole,
            as: 'roles',
            attributes: ['id', 'name', 'description'],
            through: { attributes: [] },
            include: [
              {
                model: Permission,
                as: 'permissions',
                through: { model: RolePermission, attributes: ['effective_from', 'effective_until', 'constraint_data'] }
              }
            ]
          }
        ]
      });
      
      if (!user) {
        return [];
      }
      
      return user.roles || [];
    } catch (error) {
      console.error('Error getting user roles:', error);
      throw error;
    }
  }

  static async hasRole(userId, roleName, companyId) {
    try {
      const roles = await this.getUserRoles(userId, companyId);
      return roles.some(role => role.name === roleName);
    } catch (error) {
      console.error('Error checking user role:', error);
      throw error;
    }
  }
}

module.exports = UserFactory;
