const multer = require('multer');
const xlsx = require('xlsx');
const { DirectoryRecord, DirectoryValue, DirectoryField, CompanyDirectory, Directory } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'), false);
    }
  }
});

const fileParserController = {
  // Parse Excel file and create directory records with metadata support
  parseBankStatement: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { directoryId, companyId } = req.body;
      
      if (!directoryId || !companyId) {
        return res.status(400).json({ message: 'directoryId and companyId are required' });
      }

      // Find the directory and company directory
      const directory = await Directory.findByPk(directoryId);
      if (!directory) {
        return res.status(404).json({ message: 'Directory not found' });
      }

      const companyDirectory = await CompanyDirectory.findOne({
        where: { directory_id: directoryId, company_id: companyId }
      });

      if (!companyDirectory) {
        return res.status(404).json({ message: 'Company directory not found' });
      }

      // Get directory metadata
      const directoryMetadata = directory.metadata || {};
      const {
        groupBy,
        sheetName = 'Sheet1',
        horizontalOffset = 0,
        verticalOffset = 0
      } = directoryMetadata;

      // Get directory fields ordered by fieldOrder
      const fields = await DirectoryField.findAll({
        where: { directory_id: directoryId },
        order: [['metadata', 'fieldOrder', 'ASC']]
      });

      if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields found for this directory' });
      }

      // Parse the Excel file
      let workbook;
      try {
        workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      } catch (error) {
        return res.status(400).json({ message: 'Failed to parse Excel file. Please check the file format.' });
      }

      // Get the specified sheet
      if (!workbook.SheetNames.includes(sheetName)) {
        return res.status(400).json({ 
          message: `Sheet '${sheetName}' not found. Available sheets: ${workbook.SheetNames.join(', ')}` 
        });
      }

      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < verticalOffset + 1) {
        return res.status(400).json({ message: 'File is empty or has insufficient data rows' });
      }

      // Extract headers from the specified offset
      const headerRow = data[verticalOffset];
      if (!headerRow || headerRow.length === 0) {
        return res.status(400).json({ message: 'No headers found at the specified offset' });
      }

      // Get data rows starting from verticalOffset + 1
      const dataRows = data.slice(verticalOffset + 1);

      // Map fields to columns based on fieldOrder metadata
      const fieldColumnMap = {};
      fields.forEach(field => {
        const fieldOrder = field.metadata?.fieldOrder;
        if (fieldOrder !== undefined && fieldOrder !== null) {
          // fieldOrder represents the column index (0-based)
          const columnIndex = parseInt(fieldOrder) + parseInt(horizontalOffset);
          if (columnIndex >= 0 && columnIndex < headerRow.length) {
            fieldColumnMap[field.id] = {
              field,
              columnIndex,
              headerValue: headerRow[columnIndex]
            };
          }
        }
      });

      if (Object.keys(fieldColumnMap).length === 0) {
        return res.status(400).json({ 
          message: 'No fields mapped to columns. Check fieldOrder metadata and offsets.' 
        });
      }

      // Validate groupBy field if specified
      if (groupBy) {
        const groupByField = fields.find(f => f.name === groupBy);
        if (!groupByField) {
          return res.status(400).json({ 
            message: `GroupBy field '${groupBy}' not found in directory fields` 
          });
        }
        if (!fieldColumnMap[groupByField.id]) {
          return res.status(400).json({ 
            message: `GroupBy field '${groupBy}' is not mapped to any column. Check fieldOrder metadata.` 
          });
        }
      }

      // Create directory records
      const createdRecords = [];
      let recordsCount = 0;
      const fileName = req.file.originalname;

      for (const row of dataRows) {
        if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows

        const recordId = uuidv4();
        
        // Create directory record
        const directoryRecord = await DirectoryRecord.create({
          id: recordId,
          company_directory_id: companyDirectory.id
        });

        // Create directory values
        const values = [];
        for (const [fieldId, fieldInfo] of Object.entries(fieldColumnMap)) {
          const { field, columnIndex } = fieldInfo;
          const cellValue = row[columnIndex];
          
          if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
            let processedValue = cellValue;

            // Special handling for groupBy field - assign filename
            if (groupBy && field.name === groupBy) {
              processedValue = fileName;
            } else {
              // Process value based on field type
              switch (field.type) {
                case 'date':
                  if (typeof cellValue === 'string') {
                    const date = new Date(cellValue);
                    if (!isNaN(date.getTime())) {
                      processedValue = date.toISOString().split('T')[0];
                    }
                  }
                  break;
                case 'integer':
                case 'number':
                  processedValue = parseFloat(cellValue) || 0;
                  break;
                case 'decimal':
                  processedValue = parseFloat(cellValue) || 0;
                  break;
                default:
                  processedValue = String(cellValue);
              }
            }

            values.push({
              id: uuidv4(),
              directory_record_id: recordId,
              field_id: field.id,
              value: processedValue
            });
          }
        }

        if (values.length > 0) {
          await DirectoryValue.bulkCreate(values);
          createdRecords.push(directoryRecord);
          recordsCount++;
        }
      }

      res.json({
        message: 'File parsed successfully',
        fileName,
        recordsCount,
        createdRecords: createdRecords.length,
        metadata: {
          groupBy,
          sheetName,
          horizontalOffset,
          verticalOffset,
          fieldsMapped: Object.keys(fieldColumnMap).length
        }
      });

    } catch (error) {
      console.error('File parsing error:', error);
      res.status(500).json({ 
        message: 'Failed to parse file',
        error: error.message 
      });
    }
  },

  // Parse Excel file with AI (legacy method - kept for compatibility)
  parseExcelFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      // Parse the Excel file
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      // For now, return the parsed data as-is
      // In a real implementation, you would use AI to parse according to the prompt
      res.json({
        fileName: req.file.originalname,
        recordsCount: data.length,
        records: data
      });

    } catch (error) {
      console.error('Excel parsing error:', error);
      res.status(500).json({ 
        message: 'Failed to parse Excel file',
        error: error.message 
      });
    }
  }
};

module.exports = { fileParserController, upload }; 