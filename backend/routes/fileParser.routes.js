const express = require('express');
const { FileParserController, uploadMiddleware } = require('../controllers/fileParser.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route POST /api/file-parser/excel
 * @desc Upload and parse Excel file with custom AI prompt
 * @access Private
 */
router.post('/excel', uploadMiddleware, FileParserController.parseExcelFile);

module.exports = router; 