const express = require("express");
const router = express.Router();
const { authenticateUser, checkRole } = require("../middleware/auth");
const { authorize } = require("../middleware/permissionMiddleware");
const DirectoryFactory = require("../factories/DirectoryFactory");
const { Company } = require("../models");
const UserFactory = require("../factories/UserFactory");
const CompanyFactory = require("../factories/CompanyFactory");
const {
  PERMISSION_TYPES,
  ENTITY_TYPES,
  USER_ROLES,
} = require("../utils/constants");

// Create a new directory type
router.post(
  "/directories",
  authenticateUser,
  authorize(PERMISSION_TYPES.CREATE, () => ENTITY_TYPES.DIRECTORY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const { name, attributes } = req.body;

      // Validate input
      if (!name || !attributes || !Array.isArray(attributes)) {
        return res.status(400).json({ error: "Invalid input data" });
      }

      // Validate attributes
      for (const attr of attributes) {
        if (!attr.name || !attr.data_type) {
          return res.status(400).json({ error: "Invalid attribute data" });
        }
        if (attr.data_type === "relation" && !attr.relation_type_id) {
          return res
            .status(400)
            .json({
              error: "Relation type ID required for relation attributes",
            });
        }
      }

      const directory = await DirectoryFactory.createDirectory({
        name,
        attributes,
      });
      res.status(201).json(directory);
    } catch (error) {
      console.error("Error creating directory:", error);
      res.status(500).json({ error: "Failed to create directory" });
    }
  }
);

// Assign directory to company
router.post(
  "/companies/:company_id/directories/:directory_type_id",
  authenticateUser,
  authorize(PERMISSION_TYPES.EDIT, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const { company_id, directory_type_id } = req.params;

      // Validate company exists
      const company = await Company.findByPk(company_id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const directory = await DirectoryFactory.assignDirectoryToCompany(
        company_id,
        directory_type_id
      );
      res.status(200).json(directory);
    } catch (error) {
      console.error("Error assigning directory to company:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to assign directory to company" });
    }
  }
);

// Get all directories
router.get(
  "/directories",
  authenticateUser,
  authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.DIRECTORY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const directories = await DirectoryFactory.getDirectoryById(null, {
        include: [
          {
            model: DirectoryAttribute,
            as: "attributes",
          },
        ],
      });
      res.json(directories);
    } catch (error) {
      console.error("Error fetching directories:", error);
      res.status(500).json({ error: "Failed to fetch directories" });
    }
  }
);

// Get all companies
router.get(
  "/companies",
  authenticateUser,
  async (req, res) => {
    try {
      const companies = await CompanyFactory.findAll();
      res.json(companies);
    } catch (error) {
      console.error("Error getting companies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create company
router.post(
  "/companies",
  authenticateUser,
  authorize(PERMISSION_TYPES.CREATE, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const company = await CompanyFactory.create(req.body);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update company
router.put(
  "/companies/:id",
  authenticateUser,
  authorize(PERMISSION_TYPES.EDIT, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const company = await CompanyFactory.update(req.params.id, req.body);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete company
router.delete(
  "/companies/:id",
  authenticateUser,
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      await CompanyFactory.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get all users
router.get(
  "/users",
  authenticateUser,
  authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.USER),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const users = await UserFactory.findAll();
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create user
router.post(
  "/users",
  authenticateUser,
  authorize(PERMISSION_TYPES.CREATE, () => ENTITY_TYPES.USER),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const user = await UserFactory.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update user
router.put(
  "/users/:id",
  authenticateUser,
  authorize(PERMISSION_TYPES.EDIT, () => ENTITY_TYPES.USER),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const user = await UserFactory.update(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete user
router.delete(
  "/users/:id",
  authorize(PERMISSION_TYPES.DELETE, () => ENTITY_TYPES.USER),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      await UserFactory.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get companies with pagination
router.get(
  "/",
  authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const { page, limit, search } = req.query;

      console.log("GET /api/admin/companies headers:", req.headers);
      console.log("GET /api/admin/companies cookies:", req.cookies);
      console.log("GET /api/admin/companies req.user:", req.user);
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      console.log(`Super admin ${req.user.username} accessed companies list`);

      const result = await CompanyFactory.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || "",
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  }
);

// Create new company
router.post(
  "/",
  authenticateUser,
  authorize(PERMISSION_TYPES.CREATE, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const { name, admin_email } = req.body;

      // Validate input
      if (!name || !admin_email) {
        return res
          .status(400)
          .json({ error: "Name and admin email are required" });
      }

      console.log("POST /api/admin/companies headers:", req.headers);
      console.log("POST /api/admin/companies cookies:", req.cookies);
      console.log("POST /api/admin/companies req.user:", req.user);
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const company = await CompanyFactory.create({ name, admin_email });

      console.log(`Super admin ${req.user.username} created company: ${name}`);

      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return res
          .status(400)
          .json({ error: "Company name or email already exists" });
      }
      res.status(500).json({ error: "Failed to create company" });
    }
  }
);

// Get company details
router.get(
  "/:company_id",
  authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const { company_id } = req.params;

      const company = await CompanyFactory.findById(company_id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const stats = await CompanyFactory.getCompanyStats(company_id);
      res.json({ ...company.toJSON(), ...stats });
    } catch (error) {
      console.error("Error fetching company details:", error);
      res.status(500).json({ error: "Failed to fetch company details" });
    }
  }
);

// Update company
router.put(
  "/:company_id",
  authorize(PERMISSION_TYPES.EDIT, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
    try {
      const { company_id } = req.params;
      const { name, admin_email } = req.body;

      if (!name && !admin_email) {
        return res
          .status(400)
          .json({ error: "At least one field to update is required" });
      }

      console.log("PUT /api/admin/companies headers:", req.headers);
      console.log("PUT /api/admin/companies cookies:", req.cookies);
      console.log("PUT /api/admin/companies req.user:", req.user);
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const company = await CompanyFactory.update(company_id, {
        name,
        admin_email,
      });

      console.log(
        `Super admin ${req.user.username} updated company ${company_id}`
      );

      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      if (error.message === "Company not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.name === "SequelizeUniqueConstraintError") {
        return res
          .status(400)
          .json({ error: "Company name or email already exists" });
      }
      res.status(500).json({ error: "Failed to update company" });
    }
  }
);

// Get employees for a company with filters, sorting, and pagination
router.get("/:company_id/employees",
  authenticateUser,
  authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  async (req, res) => {
  try {
    const { company_id } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = "created_at",
      order = "DESC",
      ...filters
    } = req.query;
    const result = await CompanyFactory.getEmployees({
      companyId: company_id,
      filters,
      sort,
      order,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching company employees:", error);
    res.status(500).json({ error: "Failed to fetch company employees" });
  }
});

module.exports = router;
