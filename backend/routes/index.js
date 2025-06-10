const express = require("express");
const router = express.Router();
const directoryRoutes = require("./directory.routes");
const companyDirectoryRoutes = require("./company-directory.routes");
const userRoutes = require("./users");
const superadminRoutes = require("./superadmin");
const receiptRoutes = require("./receipts");
const statisticsRouter = require("./statistics");
const modulesRouter = require("./modules");
const companiesRouter = require("./companies");
const rolesRouter = require("./roles");
const reportStructureRoutes = require("./reportStructureRoutes");

// Mount routes 
router.use("/directories", directoryRoutes);
router.use("/company-directories", companyDirectoryRoutes);
router.use("/users", userRoutes);
router.use("/admin", superadminRoutes);
router.use("/receipts", receiptRoutes);
router.use("/statistics", statisticsRouter);
router.use("/modules", modulesRouter);
router.use("/companies", companiesRouter);
router.use("/roles", rolesRouter);
router.use("/report-structures", reportStructureRoutes);

module.exports = router;
