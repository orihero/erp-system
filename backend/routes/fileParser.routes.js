const express = require('express');
const router = express.Router();
const { fileParserController, upload } = require('../controllers/fileParser.controller');
const { authenticateUser } = require('../middleware/auth');

// Parse Excel file with AI prompt (legacy)
router.post('/parse-excel', authenticateUser, upload.single('excelFile'), fileParserController.parseExcelFile);

// Parse bank statement file and create directory records
router.post('/parse-bank-statement', authenticateUser, upload.single('file'), fileParserController.parseBankStatement);

module.exports = router; 