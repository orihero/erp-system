const DirectoryFactory = require("../factories/DirectoryFactory");
const { Company } = require("../models");
const UserFactory = require("../factories/UserFactory");
const CompanyFactory = require("../factories/CompanyFactory");
const { PERMISSION_TYPES, ENTITY_TYPES, USER_ROLES } = require("../utils/constants");

module.exports = {
  async createDirectory(req, res) {
    try {
      const { name, attributes } = req.body;
      if (!name || !attributes || !Array.isArray(attributes)) {
        return res.status(400).json({ error: "Directory name and valid attributes array are required." });
      }
      for (const attr of attributes) {
        if (!attr.name || !attr.data_type) {
          return res.status(400).json({ error: "Each attribute must have a name and data_type." });
        }
        if (attr.data_type === "relation" && !attr.relation_type_id) {
          return res.status(400).json({ error: "Relation type ID required for relation attributes." });
        }
      }
      const directory = await DirectoryFactory.createDirectory({ name, attributes });
      res.status(201).json(directory);
    } catch (error) {
      console.error("Error creating directory:", error);
      res.status(500).json({ error: `Failed to create directory: ${error.message}` });
    }
  },

  async assignDirectoryToCompany(req, res) {
    try {
      const { company_id, directory_type_id } = req.params;
      const company = await Company.findByPk(company_id);
      if (!company) {
        return res.status(404).json({ error: "Company not found." });
      }
      const directory = await DirectoryFactory.assignDirectoryToCompany(company_id, directory_type_id);
      res.status(200).json(directory);
    } catch (error) {
      console.error("Error assigning directory to company:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: `Failed to assign directory to company: ${error.message}` });
    }
  },

  async getAllDirectories(req, res) {
    try {
      const directories = await DirectoryFactory.getDirectoryById(null, {
        include: [
          {
            model: require("../models").DirectoryAttribute,
            as: "attributes",
          },
        ],
      });
      res.json(directories);
    } catch (error) {
      console.error("Error fetching directories:", error);
      res.status(500).json({ error: `Failed to fetch directories: ${error.message}` });
    }
  },

  async getAllCompanies(req, res) {
    try {
      const companies = await CompanyFactory.findAll();
      res.json(companies);
    } catch (error) {
      console.error("Error getting companies:", error);
      res.status(500).json({ error: `Failed to fetch companies: ${error.message}` });
    }
  },

  async createCompany(req, res) {
    try {
      const company = await CompanyFactory.create(req.body);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ error: `Failed to create company: ${error.message}` });
    }
  },

  async updateCompany(req, res) {
    try {
      const company = await CompanyFactory.update(req.params.id, req.body);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ error: `Failed to update company: ${error.message}` });
    }
  },

  async deleteCompany(req, res) {
    try {
      await CompanyFactory.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ error: `Failed to delete company: ${error.message}` });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await UserFactory.findAll();
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ error: `Failed to fetch users: ${error.message}` });
    }
  },

  async createUser(req, res) {
    try {
      const user = await UserFactory.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: `Failed to create user: ${error.message}` });
    }
  },

  // Add more handlers as needed for the rest of the routes in superadmin.js
}; 