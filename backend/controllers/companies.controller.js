const CompanyFactory = require("../factories/CompanyFactory");

module.exports = {
  async getAllCompanies(req, res) {
    try {
      const { page, limit, search } = req.query;
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized." });
      }
      const result = await CompanyFactory.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || "",
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies: " + error.message });
    }
  },

  async createCompany(req, res) {
    try {
      const { name, admin_email } = req.body;
      if (!name || !admin_email) {
        return res.status(400).json({ error: "Name and admin email are required." });
      }
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized." });
      }
      const company = await CompanyFactory.create({ name, admin_email });
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "Company name or email already exists." });
      }
      res.status(500).json({ error: "Failed to create company: " + error.message });
    }
  },

  async getCompanyDetails(req, res) {
    try {
      const { company_id } = req.params;
      const company = await CompanyFactory.findById(company_id);
      if (!company) {
        return res.status(404).json({ error: "Company not found." });
      }
      const stats = await CompanyFactory.getCompanyStats(company_id);
      res.json({ ...company.toJSON(), ...stats });
    } catch (error) {
      console.error("Error fetching company details:", error);
      res.status(500).json({ error: "Failed to fetch company details: " + error.message });
    }
  },

  async updateCompany(req, res) {
    try {
      const { company_id } = req.params;
      const { name, admin_email } = req.body;
      if (!name && !admin_email) {
        return res.status(400).json({ error: "At least one field to update is required." });
      }
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized." });
      }
      const company = await CompanyFactory.update(company_id, { name, admin_email });
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      if (error.message === "Company not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "Company name or email already exists." });
      }
      res.status(500).json({ error: "Failed to update company: " + error.message });
    }
  },

  async getCompanyEmployees(req, res) {
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
      res.status(500).json({ error: "Failed to fetch company employees: " + error.message });
    }
  },

  async getCompanyHierarchy(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized." });
      }
      const hierarchy = await CompanyFactory.getHierarchy();
      res.json(hierarchy);
    } catch (error) {
      console.error("Error fetching company hierarchy:", error);
      res.status(500).json({ error: "Failed to fetch company hierarchy: " + error.message });
    }
  }
}; 