const express = require('express');
const router = express.Router();
const { ExcelReportTemplateController, upload } = require('../controllers/excelReportTemplate.controller');
const { authenticateToken } = require('../middleware/auth');

// CRUD operations for Excel report templates
router.post('/', authenticateToken, ExcelReportTemplateController.createDraft);
router.get('/company/:companyId', authenticateToken, ExcelReportTemplateController.getDrafts);
router.get('/:id', authenticateToken, ExcelReportTemplateController.getDraft);
router.put('/:id', authenticateToken, ExcelReportTemplateController.updateDraft);
router.delete('/:id', authenticateToken, ExcelReportTemplateController.deleteDraft);

// Excel file operations
router.post('/:id/generate-excel', authenticateToken, ExcelReportTemplateController.generateExcel);
router.post('/:id/upload-configured', authenticateToken, upload.single('file'), ExcelReportTemplateController.uploadConfiguredFile);
router.get('/:id/download-configured', authenticateToken, ExcelReportTemplateController.downloadConfiguredFile);

module.exports = router;
