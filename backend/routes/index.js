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
const permissionsRouter = require("./permissions");
const reportTemplateRoutes = require("./reportTemplates");
const directoryRecordRoutes = require("./directoryRecord.routes");
const fileParserRoutes = require("./fileParser.routes");

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
router.use("/permissions", permissionsRouter);
router.use("/report-templates", reportTemplateRoutes);
router.use("/directory-records", directoryRecordRoutes);
router.use("/file-parser", fileParserRoutes);

module.exports = router;
