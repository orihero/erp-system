const multer = require('multer');
const AIParser = require('../utils/aiParser');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

class FileParserController {
  /**
   * Upload and parse Excel file with custom AI prompt
   */
  static async parseExcelFile(req, res) {
    try {
      const { prompt } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!prompt) {
        return res.status(400).json({ error: 'Parsing prompt is required' });
      }

      // Parse the Excel file using AI with custom prompt
      const aiParser = new AIParser();
      try {
        const parsedRecords = await aiParser.parseExcelFileWithCustomPrompt(
          req.file.buffer, 
          req.file.originalname,
          prompt
        );
        res.status(200).json({
          message: 'File parsed successfully',
          recordsCount: parsedRecords.length,
          fileName: req.file.originalname,
          records: parsedRecords
        });
      } catch (aiError) {
        // Log the error and any AI response if available
        if (aiError.response && aiError.response.data) {
          console.error('AI raw response:', aiError.response.data);
        }
        console.error('AI parsing error:', aiError);
        res.status(500).json({
          error: 'Failed to parse file',
          details: aiError.message
        });
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      res.status(500).json({ 
        error: 'Failed to parse file',
        details: error.message 
      });
    }
  }
}

// Export controller methods and upload middleware
module.exports = {
  FileParserController,
  uploadMiddleware: upload.single('excelFile')
}; 