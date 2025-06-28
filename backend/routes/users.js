console.log("USERS.JS LOADED");
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

// Get user navigation (modules, companyDirectories, systemDirectories)
router.get("/navigation", authenticateUser, async (req, res) => {
  console.log("NAVIGATION ENDPOINT CALLED");
  try {
    const user = await userFactory.findById(req.user.id);
    console.log("[STEP] User fetched:", user && user.id);
    if (!user) {
      console.log("[STEP] No user found, returning 404");
      return res.status(404).json({ error: "User not found" });
    }
    // Fetch roles for this user and company
    let roles;
    try {
      roles = await UserFactory.getUserRoles(user.id, user.company_id);
      console.log("[STEP] Roles fetched:", roles && roles.map(r => r.name));
    } catch (err) {
      console.log("[STEP] Error fetching roles");
      return res.status(500).json({ error: "Failed to retrieve user roles" });
    }
    if (!roles || roles.length === 0) {
      console.log("[STEP] No roles assigned, returning 403");
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
      console.log("[STEP] Enabled company modules fetched:", enabledCompanyModules.map(cm => cm.module && cm.module.name));
    } catch (err) {
      console.log("[STEP] Error fetching modules or directories");
      return res.status(500).json({ error: "Failed to retrieve modules or directories" });
    }

    let accessibleModules = [];
    let accessibleDirectories = [];
    let accessibleCompanyModules = [];

    try {
      if (isSuperAdmin && !user.company_id) {
        accessibleModules = await Module.findAll();
        accessibleDirectories = await Directory.findAll();
        console.log("[STEP] SuperAdmin (no company): all modules and directories fetched");
      } else if (isSuperAdmin) {
        accessibleModules = enabledCompanyModules.map(cm => cm.module).filter(Boolean);
        accessibleCompanyModules = enabledCompanyModules;
        accessibleDirectories = companyDirectories.map(cd => cd.directory).filter(Boolean);
        console.log("[STEP] SuperAdmin (with company): modules and directories filtered");
      } else {
        console.log("[STEP] About to process permissions for regular user");
        const userPermissions = [];
        roles.forEach(role => {
          (role.permissions || []).forEach(permission => {
            userPermissions.push(permission);
          });
        });
        const modulePerms = {};
        const directoryPerms = {};
        userPermissions.forEach(p => {
          // Only allow modules with 'read' or 'manage' permissions (no other types)
          if (p.module_id && (p.type === 'read' || p.type === 'manage') && !p.directory_id) {
            modulePerms[p.module_id] = true;
          }
          if (p.directory_id && (p.type === 'read' || p.type === 'manage')) {
            directoryPerms[p.directory_id] = true;
          }
        });
        console.log("[STEP] modulePerms:", modulePerms);
        // Strictly filter enabled company modules to only those with correct permissions
        accessibleCompanyModules = enabledCompanyModules.filter(cm => modulePerms[cm.module_id]);
        // Only include modules for which the user has permission (do not fallback to all enabled modules)
        accessibleModules = accessibleCompanyModules.map(cm => cm.module).filter(Boolean);
        // Defensive: filter out any modules not in modulePerms (double check)
        accessibleModules = accessibleModules.filter(m => modulePerms[m.id]);
        console.log('[STEP] Accessible modules after filtering:', accessibleModules.map(m => m.name));
        // For each accessible module, include all directories belonging to that module
        const moduleIdToDirectories = {};
        companyDirectories.forEach(cd => {
          if (!cd.directory) return;
          if (cd.directory.directory_type !== 'Module') return;
          // Find the company module for this directory
          const cm = enabledCompanyModules.find(m => m.id === cd.module_id);
          if (!cm) return;
          const moduleId = cm.module.id;
          if (!moduleIdToDirectories[moduleId]) moduleIdToDirectories[moduleId] = [];
          moduleIdToDirectories[moduleId].push(cd.directory);
        });
        console.log('[DEBUG] moduleIdToDirectories:', Object.fromEntries(Object.entries(moduleIdToDirectories).map(([k, v]) => [k, v.map(d => d.name)])));
        // Compose modules with their directories
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
      console.log("[STEP] Error aggregating permissions", err);
      return res.status(500).json({ error: "Failed to aggregate user permissions" });
    }

    // Classify directories by type
    const directoriesByType = { Module: [], Company: [], System: [] };
    accessibleDirectories.forEach(dir => {
      if (dir && directoriesByType[dir.directory_type]) {
        directoriesByType[dir.directory_type].push(dir);
      }
    });

    // Build a map of moduleId -> directories of type 'Module'
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

    // Use the accessibleModules array (with directories attached) as the final modules array
    const modules = accessibleModules;

    // Company directories (type Company)
    const companyDirectoriesArr = companyDirectories
      .filter(cd => cd.directory && cd.directory.directory_type === 'Company')
      .map(cd => ({ ...cd.directory.toJSON() }));

    // System directories (type System)
    const systemDirectoriesArr = companyDirectories
      .filter(cd => cd.directory && cd.directory.directory_type === 'System')
      .map(cd => ({ ...cd.directory.toJSON() }));

    res.json({
      modules,
      companyDirectories: companyDirectoriesArr,
      systemDirectories: systemDirectoriesArr
    });
  } catch (error) {
    console.error("Error fetching user navigation:", error);
    res.status(500).json({ error: "An unexpected error occurred while fetching user navigation" });
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
    res.json({
      ...user.toJSON(),
      roles: roles.map(role => ({
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
