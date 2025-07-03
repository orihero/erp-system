console.log("USERS.JS LOADED");
const express = require("express");
const router = express.Router();
const { authenticateUser, checkRole } = require("../middleware/auth");
const { authorize } = require("../middleware/permissionMiddleware");
const { USER_ROLES } = require("../utils/constants");
const models = require("../models");
const { User } = models;
const usersController = require("../controllers/users.controller.js");

// Register new user
router.post("/register", usersController.register);

// Login user
router.post("/login", usersController.login);

// Get user navigation (modules, companyDirectories, systemDirectories)
router.get("/navigation", authenticateUser, usersController.getNavigation);

// Get user profile
router.get("/profile", authenticateUser, usersController.getProfile);

// Update user profile
router.put("/profile", authenticateUser, usersController.updateProfile);

// Change password
router.put("/change-password", authenticateUser, usersController.changePassword);

// Get current user
router.get("/me", authenticateUser, usersController.getMe);

// Get all users (admin only)
router.get(
  "/",
  authenticateUser,
  authorize(null, null, null, null, 'users.view'),
  checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]),
  usersController.getAll
);

// Create user (admin only)
router.post("/", authenticateUser, checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), usersController.createUser);

// Update user (admin only)
router.put(
  "/:id",
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
  usersController.updateUser
);

// Delete user (admin only)
router.delete("/:id", authenticateUser, checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), usersController.deleteUser);

// Assign role to user (admin only)
router.post("/:id/roles", authenticateUser, checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), usersController.assignRole);

// Remove role from user (admin only)
router.delete("/:id/roles/:roleId", authenticateUser, checkRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), usersController.removeRole);

module.exports = router;
