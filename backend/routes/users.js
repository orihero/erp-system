const express = require("express");
const router = express.Router();
const UserFactory = require("../factories/UserFactory");
const CompanyFactory = require("../factories/CompanyFactory");
const { authenticateToken, checkRole } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const models = require("../models");

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
      company_id: company.id,
      role: "admin", // First user of the company is admin
    });

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
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
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
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        company_id: user.company_id,
        roles: roles.map(role => role.name)
      },
      token
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await userFactory.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
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
router.put("/change-password", authenticateToken, async (req, res) => {
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
router.get("/me", authenticateToken, async (req, res) => {
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
router.get("/", authenticateToken, checkRole(["super_admin", "admin"]), async (req, res) => {
  try {
    const users = await userFactory.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create user (admin only)
router.post("/", authenticateToken, checkRole(["super_admin", "admin"]), async (req, res) => {
  try {
    const user = await UserFactory.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user (admin only)
router.put("/:id", authenticateToken, checkRole(["super_admin", "admin"]), async (req, res) => {
  try {
    const user = await UserFactory.update(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete user (admin only)
router.delete("/:id", authenticateToken, checkRole(["super_admin", "admin"]), async (req, res) => {
  try {
    await UserFactory.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Assign role to user (admin only)
router.post("/:id/roles", authenticateToken, checkRole(["super_admin", "admin"]), async (req, res) => {
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
router.delete("/:id/roles/:roleId", authenticateToken, checkRole(["super_admin", "admin"]), async (req, res) => {
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
