const express = require('express');
const router = express.Router();
const ReportTemplateController = require('../controllers/ReportTemplateController');
const ReportBindingController = require('../controllers/ReportBindingController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const ValidationService = require('../services/ValidationService');

// Middleware for validating report templates
async function validateReportTemplate(req, res, next) {
  try {
    const validation = await ValidationService.validateTemplateData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Validation error', details: err.message });
  }
}

// Middleware for validating bindings
async function validateBinding(req, res, next) {
  try {
    const validation = await ValidationService.validateBindingStep(req.body);
    if (validation && validation.errors && validation.errors.length > 0) {
      return res.status(400).json({ error: 'Binding validation failed', details: validation.errors });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Binding validation error', details: err.message });
  }
}

// Template CRUD operations
router.get('/', authenticateToken, ReportTemplateController.listTemplates);
router.post('/', authenticateToken, checkRole(['super_admin']), validateReportTemplate, ReportTemplateController.createTemplate);
router.get('/:id', authenticateToken, ReportTemplateController.getTemplate);
router.put('/:id', authenticateToken, checkRole(['super_admin']), validateReportTemplate, ReportTemplateController.updateTemplate);
router.delete('/:id', authenticateToken, checkRole(['super_admin']), ReportTemplateController.deleteTemplate);

// Template management
router.post('/:id/clone', authenticateToken, checkRole(['super_admin']), ReportTemplateController.cloneTemplate);
router.get('/:id/versions', authenticateToken, ReportTemplateController.getTemplateVersions);
router.post('/:id/versions/:version/restore', authenticateToken, checkRole(['super_admin']), ReportTemplateController.restoreVersion);

// Binding management
router.get('/:id/bindings', authenticateToken, ReportBindingController.getTemplateBindings);
router.post('/:id/bindings', authenticateToken, checkRole(['super_admin']), validateBinding, ReportBindingController.createBinding);
router.put('/:id/bindings/:bindingId', authenticateToken, checkRole(['super_admin']), validateBinding, ReportBindingController.updateBinding);
router.delete('/:id/bindings/:bindingId', authenticateToken, checkRole(['super_admin']), ReportBindingController.deleteBinding);

// Wizard support endpoints
router.get('/wizard/categories', authenticateToken, ReportTemplateController.getCategories);
router.get('/wizard/companies', authenticateToken, ReportBindingController.getAvailableCompanies);
router.get('/wizard/modules', authenticateToken, ReportBindingController.getAvailableModules);
router.post('/wizard/validate-step', authenticateToken, ReportTemplateController.validateWizardStep);
router.post('/wizard/preview', authenticateToken, ReportTemplateController.previewTemplate);

// Data source endpoints
router.get('/data-sources', authenticateToken, ReportTemplateController.getDataSources);
router.get('/data-sources/:id/schema', authenticateToken, ReportTemplateController.getDataSourceSchema);
router.post('/data-sources/:id/test', authenticateToken, ReportTemplateController.testDataSource);
router.post('/data-sources/validate-query', authenticateToken, ReportTemplateController.validateQuery);

// Report generation
router.post('/:id/generate', authenticateToken, ReportTemplateController.generateReport);
router.get('/executions', authenticateToken, ReportTemplateController.getExecutionHistory);
router.get('/executions/:executionId/download', authenticateToken, ReportTemplateController.downloadReport);

// New route for POST /api/report-templates/validate-name
router.post('/validate-name', authenticateToken, ReportTemplateController.validateTemplateName);

module.exports = router; 