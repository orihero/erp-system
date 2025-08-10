const express = require("express");
const router = express.Router();
const CompanyFactory = require("../factories/CompanyFactory");
const { authenticateUser, checkRole } = require("../middleware/auth");
const { USER_ROLES, PERMISSION_TYPES, ENTITY_TYPES } = require("../utils/constants");
const { authorize } = require("../middleware/permissionMiddleware");
const companiesController = require("../controllers/companies.controller");

// Get companies with pagination
router.get(
  "/",
  authenticateUser,
  authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  companiesController.getAllCompanies
);

// Create new company
router.post(
  "/",
  authenticateUser,
  authorize(PERMISSION_TYPES.CREATE, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  companiesController.createCompany
);

// Get company details
router.get(
  "/:company_id",
  authenticateUser,
  authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  companiesController.getCompanyDetails
);

// Update company
router.put(
  "/:company_id",
  authenticateUser,
  authorize(PERMISSION_TYPES.EDIT, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  companiesController.updateCompany
);

// Get employees for a company with filters, sorting, and pagination
router.get(
  "/:company_id/employees",
  authenticateUser,
  authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  companiesController.getCompanyEmployees
);

// Get company hierarchy (tree)
router.get(
  "/hierarchy",
  authenticateUser,
  authorize(PERMISSION_TYPES.READ, () => ENTITY_TYPES.COMPANY),
  checkRole([USER_ROLES.SUPER_ADMIN]),
  companiesController.getCompanyHierarchy
);

module.exports = router;
