const UserFactory = require("../factories/UserFactory");
const CompanyFactory = require("../factories/CompanyFactory");
const { USER_ROLES } = require("../utils/constants");
const jwt = require("jsonwebtoken");
const models = require("../models");
const { User } = models;

const userFactory = new UserFactory(models);

// Helper function to map numeric employee count to enum value
const mapEmployeeCount = (count) => {
  if (count < 10) return "less_than_10";
  if (count <= 50) return "10_to_50";
  if (count <= 100) return "50_to_100";
  if (count <= 500) return "100_to_500";
  if (count <= 1000) return "500_to_1000";
  return "more_than_1000";
};

module.exports = {
  async register(req, res) {
    try {
      const { email, password, company_name, employee_count } = req.body;
      const company = await CompanyFactory.create({
        name: company_name,
        admin_email: email,
        employee_count: mapEmployeeCount(employee_count),
      });
      const user = await userFactory.create({
        email,
        password,
        company_id: company.id
      });
      const adminRole = await models.UserRole.findOne({ where: { name: 'admin' } });
      if (!adminRole) {
        return res.status(500).json({ error: 'Admin role not found in the system. Please contact support.' });
      }
      await UserFactory.assignRole(user.id, adminRole.id, company.id);
      const roles = await UserFactory.getUserRoles(user.id, user.company_id);
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          company_id: user.company_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.status(201).json({
        ...user.toJSON(),
        roles: roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: (role.permissions || []).map(permission => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            type: permission.type,
            module_id: permission.module_id,
            directory_id: permission.directory_id,
            effective_from: permission.RolePermission?.effective_from,
            effective_until: permission.RolePermission?.effective_until,
            constraint_data: permission.RolePermission?.constraint_data
          }))
        })),
        token,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "A user with this email already exists." });
      }
      res.status(500).json({ error: `Registration failed: ${error.message}` });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserFactory.authenticate(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      if (user.status !== "active") {
        return res.status(401).json({ message: "Your account is not active. Please contact your administrator." });
      }
      const roles = await UserFactory.getUserRoles(user.id, user.company_id);
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          company_id: user.company_id,
          roles: roles.map(role => role.name)
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({
        ...user.toJSON(),
        roles: roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: (role.permissions || []).map(permission => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            type: permission.type,
            module_id: permission.module_id,
            directory_id: permission.directory_id,
            effective_from: permission.RolePermission?.effective_from,
            effective_until: permission.RolePermission?.effective_until,
            constraint_data: permission.RolePermission?.constraint_data
          }))
        })),
        token
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: `Login failed: ${error.message}` });
    }
  },

  async getNavigation(req, res) {
    try {
      // The authenticateUser middleware already loads the user with roles and permissions
      const user = req.user;
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      
      const roles = user.roles;
      if (!roles || roles.length === 0) {
        return res.status(403).json({ error: "No roles assigned to this user." });
      }
      const isSuperAdmin = roles.some(role => role.is_super_admin);
      const { CompanyModule, Module, CompanyDirectory, Directory, ExcelReportTemplate } = require('../models');
      
      // Get module ID from query params (for module-specific filtering)
      const moduleId = req.query.moduleId;
      let enabledCompanyModules, companyDirectories;
      try {
        enabledCompanyModules = await CompanyModule.findAll({
          where: { company_id: user.company_id, is_enabled: true },
          include: [{ model: Module, as: 'module' }]
        });
        companyDirectories = await CompanyDirectory.findAll({
          where: { company_id: user.company_id },
          include: [{ model: Directory, as: 'directory' }]
        });
      } catch (err) {
        return res.status(500).json({ error: "Failed to retrieve modules or directories for the user." });
      }
      let accessibleModules = [];
      let accessibleDirectories = [];
      let accessibleCompanyModules = [];
      try {
        if (isSuperAdmin && !user.company_id) {
          accessibleModules = await Module.findAll();
          accessibleDirectories = await Directory.findAll();
        } else if (isSuperAdmin) {
          accessibleModules = enabledCompanyModules.map(cm => cm.module).filter(Boolean);
          accessibleCompanyModules = enabledCompanyModules;
          accessibleDirectories = companyDirectories.map(cd => cd.directory).filter(Boolean);
        } else {
          const userPermissions = [];
          roles.forEach(role => {
            (role.permissions || []).forEach(permission => {
              userPermissions.push(permission);
            });
          });
          const modulePerms = {};
          const directoryPerms = {};
          userPermissions.forEach(p => {
            if (p.module_id && (p.type === 'read' || p.type === 'manage') && !p.directory_id) {
              modulePerms[p.module_id] = true;
            }
            if (p.directory_id && (p.type === 'read' || p.type === 'manage')) {
              directoryPerms[p.directory_id] = true;
            }
          });
          accessibleCompanyModules = enabledCompanyModules.filter(cm => modulePerms[cm.module_id]);
          accessibleModules = accessibleCompanyModules.map(cm => cm.module).filter(Boolean);
          accessibleModules = accessibleModules.filter(m => modulePerms[m.id]);
          const moduleIdToDirectories = {};
          companyDirectories.forEach(cd => {
            if (!cd.directory) return;
            if (cd.directory.directory_type !== 'Module') return;
            const cm = enabledCompanyModules.find(m => m.id === cd.module_id);
            if (!cm) return;
            const moduleId = cm.module.id;
            if (!moduleIdToDirectories[moduleId]) moduleIdToDirectories[moduleId] = [];
            moduleIdToDirectories[moduleId].push(cd.directory);
          });
          accessibleModules = accessibleModules.map(mod => {
            const plainMod = typeof mod.toJSON === 'function' ? mod.toJSON() : mod;
            return {
              ...plainMod,
              directories: (moduleIdToDirectories[plainMod.id] || []).map(dir =>
                typeof dir.toJSON === 'function' ? dir.toJSON() : dir
              )
            };
          });
        }
      } catch (err) {
        return res.status(500).json({ error: "Failed to aggregate user permissions." });
      }
      const directoriesByType = { Module: [], Company: [], System: [] };
      accessibleDirectories.forEach(dir => {
        if (dir && directoriesByType[dir.directory_type]) {
          directoriesByType[dir.directory_type].push(dir);
        }
      });
      const moduleIdToDirectories = {};
      if (isSuperAdmin && !user.company_id) {
        directoriesByType.Module.forEach(dir => {
          accessibleModules.forEach(mod => {
            if (!moduleIdToDirectories[mod.id]) moduleIdToDirectories[mod.id] = [];
            moduleIdToDirectories[mod.id].push(dir);
          });
        });
      } else {
        companyDirectories.forEach(cd => {
          if (!cd.directory) return;
          if (cd.directory.directory_type !== 'Module') return;
          if (!isSuperAdmin && !accessibleDirectories.find(d => d.id === cd.directory.id)) return;
          const cm = enabledCompanyModules.find(m => m.id === cd.module_id);
          if (!cm) return;
          const moduleId = cm.module.id;
          if (!moduleIdToDirectories[moduleId]) moduleIdToDirectories[moduleId] = [];
          moduleIdToDirectories[moduleId].push(cd.directory);
        });
      }
      const modules = accessibleModules;
      const companyDirectoriesArr = companyDirectories
        .filter(cd => cd.directory && cd.directory.directory_type === 'Company')
        .map(cd => ({ ...cd.directory.toJSON() }));
      const systemDirectoriesArr = companyDirectories
        .filter(cd => cd.directory && cd.directory.directory_type === 'System')
        .map(cd => ({ ...cd.directory.toJSON() }));

      // Check if user has access to Excel report templates
      let hasExcelReportAccess = false;
      if (!isSuperAdmin && user.company_id) {
        try {
          // Build userPermissions array for non-super admin users
          const userPermissions = [];
          roles.forEach(role => {
            (role.permissions || []).forEach(permission => {
              userPermissions.push(permission);
            });
          });
          
          // Check if user has reports.view permission
          const hasReportsPermission = userPermissions.some(p => 
            p.name === 'reports.view' || p.name === 'reports.manage'
          );

          if (hasReportsPermission) {
            // Check if there are any Excel report templates for this company and module
            const whereClause = { company_id: user.company_id };
            
            // If moduleId is provided, filter by that specific module
            if (moduleId) {
              whereClause.selected_modules = { [require('sequelize').Op.contains]: [moduleId] };
            }
            
            const excelTemplatesCount = await ExcelReportTemplate.count({
              where: whereClause
            });
            hasExcelReportAccess = excelTemplatesCount > 0;
          }
        } catch (err) {
          console.error('Error checking Excel report access:', err);
          // Don't fail the entire request, just set access to false
          hasExcelReportAccess = false;
        }
      }

      res.json({
        modules,
        companyDirectories: companyDirectoriesArr,
        systemDirectories: systemDirectoriesArr,
        hasExcelReportAccess
      });
    } catch (error) {
      console.error("Error fetching user navigation:", error);
      res.status(500).json({ error: `Failed to fetch user navigation: ${error.message}` });
    }
  },

  async getProfile(req, res) {
    try {
      // The authenticateUser middleware already loads the user with roles and permissions
      const user = req.user;
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      
      if (!user.roles || user.roles.length === 0) {
        return res.status(403).json({ error: "No roles assigned to this user." });
      }
      
      res.json({
        ...user.toJSON(),
        roles: user.roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          is_super_admin: role.is_super_admin,
          permissions: (role.permissions || []).map(permission => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            type: permission.type,
            module_id: permission.module_id,
            directory_id: permission.directory_id,
            effective_from: permission.RolePermission?.effective_from,
            effective_until: permission.RolePermission?.effective_until,
            constraint_data: permission.RolePermission?.constraint_data
          }))
        }))
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: `Failed to fetch user profile: ${error.message}` });
    }
  },

  async updateProfile(req, res) {
    try {
      const { email } = req.body;
      const user = await userFactory.update(req.user.id, { email });
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "A user with this email already exists." });
      }
      res.status(500).json({ error: `Failed to update user profile: ${error.message}` });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await userFactory.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ message: "Password updated successfully." });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async getMe(req, res) {
    try {
      // The authenticateUser middleware already loads the user with roles and permissions
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        company_id: user.company_id,
        roles: user.roles.map(role => role.name)
      });
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: `Failed to get current user: ${error.message}` });
    }
  },

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || "";
      const users = await userFactory.findAll({ page, limit, search });
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: `Failed to get users: ${error.message}` });
    }
  },

  async createUser(req, res) {
    try {
      const user = await UserFactory.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: `Failed to create user: ${error.message}` });
    }
  },

  async updateUser(req, res) {
    try {
      const { roles, ...userData } = req.body;
      const user = await userFactory.update(req.params.id, userData);
      if (Array.isArray(roles)) {
        await models.UserRoleAssignment.destroy({
          where: { user_id: req.params.id, company_id: user.company_id }
        });
        for (const roleName of roles) {
          const role = await models.UserRole.findOne({ where: { name: roleName } });
          if (role) {
            await models.UserRoleAssignment.create({
              user_id: req.params.id,
              role_id: role.id,
              company_id: user.company_id
            });
          }
        }
      }
      const updatedRoles = await models.UserRoleAssignment.findAll({
        where: { user_id: req.params.id, company_id: user.company_id },
        include: [{ model: models.UserRole, as: 'role' }]
      });
      const roleNames = updatedRoles.map(assignment => assignment.role.name);
      res.json({
        ...user.toJSON(),
        roles: roleNames
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: `Failed to update user: ${error.message}` });
    }
  },

  async deleteUser(req, res) {
    try {
      await UserFactory.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: `Failed to delete user: ${error.message}` });
    }
  },

  async assignRole(req, res) {
    try {
      const { role_id, company_id } = req.body;
      const assignment = await UserFactory.assignRole(req.params.id, role_id, company_id);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).json({ message: `Failed to assign role: ${error.message}` });
    }
  },

  async removeRole(req, res) {
    try {
      const { company_id } = req.body;
      await UserFactory.removeRole(req.params.id, req.params.roleId, company_id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing role:", error);
      res.status(500).json({ message: `Failed to remove role: ${error.message}` });
    }
  }
}; 