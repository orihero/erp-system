const express = require("express");
const router = express.Router();
const UserFactory = require("../factories/UserFactory");
const CompanyFactory = require("../factories/CompanyFactory");
const { authenticateUser, checkRole } = require("../middleware/auth");
const { authorize } = require("../middleware/permissionMiddleware");
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

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, company_name, employee_count } = req.body;

    // Create company first
    const company = await CompanyFactory.create({
      name: company_name,
      admin_email: email,
      employee_count: mapEmployeeCount(employee_count),
    });

    // Create user with company_id
    const user = await userFactory.create({
      email,
      password,
      company_id: company.id
    });

    // Find the admin role
    const adminRole = await models.UserRole.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      return res.status(500).json({ error: 'Admin role not found' });
    }
    // Assign admin role to the new user
    await UserFactory.assignRole(user.id, adminRole.id, company.id);

    // Fetch roles for this user and company
    const roles = await UserFactory.getUserRoles(user.id, user.company_id);

    // Generate JWT token
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
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserFactory.authenticate(email, password);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(401).json({ message: "Account is not active" });
    }

    // Get user roles
    const roles = await UserFactory.getUserRoles(user.id, user.company_id);

    // Generate JWT token
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
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const user = await userFactory.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Fetch roles for this user and company
    let roles;
    try {
      roles = await UserFactory.getUserRoles(user.id, user.company_id);
    } catch (err) {
      console.error("Error fetching user roles:", err);
      return res.status(500).json({ error: "Failed to retrieve user roles" });
    }
    if (!roles || roles.length === 0) {
      return res.status(403).json({ error: "No roles assigned to user" });
    }
    // Check for elevated access (super admin)
    const isSuperAdmin = roles.some(role => role.is_super_admin);

    // Fetch models
    const { CompanyModule, Module, CompanyDirectory, Directory } = require('../models');

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
      console.error("Error fetching modules or directories:", err);
      return res.status(500).json({ error: "Failed to retrieve modules or directories" });
    }

    // Helper: deduplicate by id
    const uniqueById = arr => Object.values(arr.reduce((acc, item) => { acc[item.id] = item; return acc; }, {}));

    let accessibleModules = [];
    let accessibleDirectories = [];
    let accessibleCompanyModules = [];

    try {
      if (isSuperAdmin && !user.company_id) {
        // Super admin with no company: fetch all modules and all directories
        accessibleModules = await Module.findAll();
        accessibleDirectories = await Directory.findAll();
      } else if (isSuperAdmin) {
        // Super admin: all enabled modules and all directories for their company
        accessibleModules = enabledCompanyModules.map(cm => cm.module).filter(Boolean);
        accessibleCompanyModules = enabledCompanyModules;
        accessibleDirectories = companyDirectories.map(cd => cd.directory).filter(Boolean);
      } else {
        // Aggregate permissions from all roles
        const userPermissions = [];
        roles.forEach(role => {
          (role.permissions || []).forEach(permission => {
            userPermissions.push(permission);
          });
        });
        // Deduplicate permissions by module_id and directory_id
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
        // Accessible company modules: those where user has permission for the abstract module
        accessibleCompanyModules = enabledCompanyModules.filter(cm => modulePerms[cm.module_id]);
        // Accessible modules: the abstract modules for which the user has permission and are enabled for the company
        accessibleModules = accessibleCompanyModules.map(cm => cm.module).filter(Boolean);
        // Accessible directories: those bound to accessible company modules, and of type 'Module'
        accessibleDirectories = companyDirectories
          .filter(cd => {
            if (!cd.directory) return false;
            if (cd.directory.directory_type !== 'Module') return false;
            // Directory-level permission
            if (directoryPerms[cd.directory.id]) return true;
            // Module-level permission (abstract module_id from company module)
            const cm = enabledCompanyModules.find(m => m.id === cd.module_id);
            if (cm && modulePerms[cm.module_id]) return true;
            return false;
          })
          .map(cd => cd.directory);
      }
    } catch (err) {
      console.error("Error aggregating permissions:", err);
      return res.status(500).json({ error: "Failed to aggregate user permissions" });
    }

    // Classify directories by type
    const directoriesByType = { Module: [], Company: [], System: [] };
    accessibleDirectories.forEach(dir => {
      if (dir && directoriesByType[dir.directory_type]) {
        directoriesByType[dir.directory_type].push(dir);
      }
    });

    // Build a map of companyModuleId -> directories of type 'Module'
    const companyModuleIdToDirectories = {};
    if (isSuperAdmin && !user.company_id) {
      // For global super admin, associate all Module-type directories to all modules
      directoriesByType.Module.forEach(dir => {
        accessibleModules.forEach(mod => {
          if (!companyModuleIdToDirectories[mod.id]) companyModuleIdToDirectories[mod.id] = [];
          companyModuleIdToDirectories[mod.id].push(dir);
        });
      });
    } else {
      companyDirectories.forEach(cd => {
        if (!cd.directory) return;
        if (cd.directory.directory_type !== 'Module') return;
        // Only include if in accessibleDirectories (for non-superadmin)
        if (!isSuperAdmin && !accessibleDirectories.find(d => d.id === cd.directory.id)) return;
        const cmId = cd.module_id;
        if (!companyModuleIdToDirectories[cmId]) companyModuleIdToDirectories[cmId] = [];
        companyModuleIdToDirectories[cmId].push(cd.directory);
      });
    }

    // Structure primary navigation: enabled company modules with at least one directory of type 'Module'
    const primary = [];
    for (const cm of accessibleCompanyModules) {
      const subItems = (companyModuleIdToDirectories[cm.id] || []).map(dir => ({
        id: dir.id,
        name: dir.name,
        icon: dir.icon_name,
        directory_type: dir.directory_type
      }));
      if (subItems.length > 0) {
        primary.push({
          id: cm.module.id, // keep using abstract module id for frontend routing
          name: cm.module.name,
          icon: cm.module.icon_name,
          subItems
        });
      }
    }

    // Structure secondary navigation: directories of type 'Company' or 'System', grouped together
    const secondary = [
      ...directoriesByType.Company,
      ...directoriesByType.System
    ].map(dir => ({
      id: dir.id,
      name: dir.name,
      icon: dir.icon_name,
      directory_type: dir.directory_type
    }));

    res.json({
      ...user.toJSON(),
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        is_super_admin: role.is_super_admin, // for frontend debugging, can be removed
        permissions: (role.permissions || []).map(permission => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          type: permission.type,
          module_id: permission.module_id,
          directory_id: permission.directory_id,
          // RolePermission join table fields:
          effective_from: permission.RolePermission?.effective_from,
          effective_until: permission.RolePermission?.effective_until,
          constraint_data: permission.RolePermission?.constraint_data
        }))
      })),
      navigation: primary,
      secondaryNavigation: secondary
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "An unexpected error occurred while fetching the user profile" });
  }
});

// Update user profile
router.put("/profile", authenticateUser, async (req, res) => {
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
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

// Change password
router.put("/change-password", authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userFactory.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get current user
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await UserFactory.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user roles
    const roles = await UserFactory.getUserRoles(user.id, user.company_id);

    res.json({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      company_id: user.company_id,
      roles: roles.map(role => role.name)
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all users (admin only)
router.get("/", 
  authenticateUser, 
  authorize(null, null, null, null, 'users.view'),
  checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), 
  async (req, res) => {
    try {
      // Parse page and limit from query string, with defaults
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || "";

      const users = await userFactory.findAll({ page, limit, search });
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create user (admin only)
router.post("/", authenticateUser, checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const user = await UserFactory.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user (admin only)
router.put("/:id", 
  authenticateUser, 
  authorize(
    'edit', 
    () => 'uuid_of_users_module',
    null,
    async (req) => {
      const user = await User.findByPk(req.params.id);
      return user;
    }
  ),
  checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), 
  async (req, res) => {
    try {
      const { roles, ...userData } = req.body;
      const user = await userFactory.update(req.params.id, userData);

      // Update roles if provided
      if (Array.isArray(roles)) {
        // Remove all current roles for this user in this company
        await models.UserRoleAssignment.destroy({
          where: { user_id: req.params.id, company_id: user.company_id }
        });
        // Add new roles
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

      // Fetch updated roles to return in response
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
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete user (admin only)
router.delete("/:id", authenticateUser, checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    await UserFactory.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Assign role to user (admin only)
router.post("/:id/roles", authenticateUser, checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const { role_id, company_id } = req.body;
    const assignment = await UserFactory.assignRole(req.params.id, role_id, company_id);
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error assigning role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Remove role from user (admin only)
router.delete("/:id/roles/:roleId", authenticateUser, checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
  try {
    const { company_id } = req.body;
    await UserFactory.removeRole(req.params.id, req.params.roleId, company_id);
    res.status(204).send();
  } catch (error) {
    console.error("Error removing role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
