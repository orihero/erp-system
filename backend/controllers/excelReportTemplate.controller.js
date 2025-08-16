const { ExcelReportTemplate, Company, User, Directory, DirectoryRecord, DirectoryValue, DirectoryField, CompanyDirectory } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/excel-reports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `excel-report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

class ExcelReportTemplateController {
  // Create a new Excel report template
  async createDraft(req, res) {
    try {
      const { companyId, name, startDate, endDate, selectedDirectories, selectedModules } = req.body;
      const userId = req.user.id;

      const draft = await ExcelReportTemplate.create({
        company_id: companyId,
        name,
        start_date: startDate,
        end_date: endDate,
        selected_directories: selectedDirectories,
        selected_modules: selectedModules || [],
        created_by: userId,
        status: 'draft'
      });

      res.status(201).json({
        success: true,
        data: draft
      });
    } catch (error) {
      console.error('Error creating Excel report template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create Excel report template'
      });
    }
  }

  // Get all templates for a company
  async getDrafts(req, res) {
    try {
      const { companyId } = req.params;
      const { page = 1, limit = 10, status, moduleId } = req.query;

      const where = { company_id: companyId };
      if (status) {
        where.status = status;
      }
      
      // Filter by module if moduleId is provided
      if (moduleId) {
        where.selected_modules = { [Op.contains]: [moduleId] };
      }

      const drafts = await ExcelReportTemplate.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstname', 'lastname', 'email']
          },
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'firstname', 'lastname', 'email']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        templates: drafts.rows, // Changed from 'data' to 'templates' to match frontend expectation
        pagination: {
          total: drafts.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(drafts.count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching Excel report templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Excel report templates'
      });
    }
  }

  // Get a specific template
  async getDraft(req, res) {
    try {
      const { id } = req.params;

      const draft = await ExcelReportTemplate.findByPk(id, {
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstname', 'lastname', 'email']
          },
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'firstname', 'lastname', 'email']
          }
        ]
      });

      if (!draft) {
        return res.status(404).json({
          success: false,
          error: 'Excel report template not found'
        });
      }

      res.json({
        success: true,
        data: draft
      });
    } catch (error) {
      console.error('Error fetching Excel report template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Excel report template'
      });
    }
  }

  // Update a template
  async updateDraft(req, res) {
    try {
      const { id } = req.params;
      const { companyId, name, startDate, endDate, selectedDirectories, selectedModules, ...otherData } = req.body;
      const userId = req.user.id;

      const draft = await ExcelReportTemplate.findByPk(id);
      if (!draft) {
        return res.status(404).json({
          success: false,
          error: 'Excel report template not found'
        });
      }

      const updateData = {
        ...otherData,
        updated_by: userId
      };

      // Map frontend field names to database field names
      if (name !== undefined) updateData.name = name;
      if (startDate !== undefined) updateData.start_date = startDate;
      if (endDate !== undefined) updateData.end_date = endDate;
      if (selectedDirectories !== undefined) updateData.selected_directories = selectedDirectories;
      if (selectedModules !== undefined) updateData.selected_modules = selectedModules;

      await draft.update(updateData);

      res.json({
        success: true,
        data: draft
      });
    } catch (error) {
      console.error('Error updating Excel report template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update Excel report template'
      });
    }
  }

  // Delete a template
  async deleteDraft(req, res) {
    try {
      const { id } = req.params;

      const draft = await ExcelReportTemplate.findByPk(id);
      if (!draft) {
        return res.status(404).json({
          success: false,
          error: 'Excel report template not found'
        });
      }

      // Delete uploaded file if exists
      if (draft.uploaded_file_path && fs.existsSync(draft.uploaded_file_path)) {
        fs.unlinkSync(draft.uploaded_file_path);
      }

      await draft.destroy();

      res.json({
        success: true,
        message: 'Excel report template deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting Excel report template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete Excel report template'
      });
    }
  }

  // Generate and download Excel file
  async generateExcel(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate, selectedDirectories } = req.body;

      const draft = await ExcelReportTemplate.findByPk(id, {
        include: [
          {
            model: Company,
            as: 'company'
          }
        ]
      });

      if (!draft) {
        return res.status(404).json({
          success: false,
          error: 'Excel report template not found'
        });
      }

      // Check if there's an uploaded configured file
      if (!draft.uploaded_file_path || !fs.existsSync(draft.uploaded_file_path)) {
        return res.status(400).json({
          success: false,
          error: 'No configured Excel file found. Please upload a configured file first.'
        });
      }

      // Load the uploaded workbook as template
      const templateWorkbook = new ExcelJS.Workbook();
      await templateWorkbook.xlsx.readFile(draft.uploaded_file_path);

      // Create new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Dynamic Report Generator';
      workbook.lastModifiedBy = 'Dynamic Report Generator';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Copy the DynamicReport sheet from template
      const templateDynamicSheet = templateWorkbook.getWorksheet('DynamicReport');
      if (templateDynamicSheet) {
        const dynamicSheet = workbook.addWorksheet('DynamicReport');
        templateDynamicSheet.eachRow((row, rowNumber) => {
          const newRow = dynamicSheet.addRow(row.values);
          // Copy row styles
          row.eachCell((cell, colNumber) => {
            const newCell = newRow.getCell(colNumber);
            if (cell.style) {
              newCell.style = cell.style;
            }
            if (cell.font) {
              newCell.font = cell.font;
            }
            if (cell.fill) {
              newCell.fill = cell.fill;
            }
          });
        });
      }

      // Add data sheets for each directory
      for (const directoryId of selectedDirectories) {
        try {
          const directory = await Directory.findByPk(directoryId);
          if (!directory) {
            console.log(`Directory not found: ${directoryId}`);
            continue;
          }

          const companyDirectory = await CompanyDirectory.findOne({
            where: {
              directory_id: directoryId,
              company_id: draft.company_id
            }
          });

          if (!companyDirectory) {
            console.log(`Company directory not found for directory: ${directoryId}, company: ${draft.company_id}`);
            continue;
          }

          // Get directory fields
          const fields = await DirectoryField.findAll({
            where: { directory_id: directoryId }
          });

          // Sort fields by fieldOrder from metadata
          const sortedFields = fields.sort((a, b) => {
            const orderA = a.metadata?.fieldOrder || 999;
            const orderB = b.metadata?.fieldOrder || 999;
            return orderA - orderB;
          });

          // Get directory records with values for the selected period
          const records = await DirectoryRecord.findAll({
            where: { 
              company_directory_id: companyDirectory.id,
              // Filter by the selected period
              ...(startDate && endDate && {
                created_at: {
                  [Op.between]: [new Date(startDate), new Date(endDate)]
                }
              })
            },
            include: [
              {
                model: DirectoryValue,
                as: 'recordValues',
                include: [
                  {
                    model: DirectoryField,
                    as: 'field'
                  }
                ]
              }
            ]
          });

          console.log(`Processing directory: ${directory.name}, fields: ${sortedFields.length}, records: ${records.length}`);

          // Create worksheet for this directory
          const worksheet = workbook.addWorksheet(directory.name);

          // Add headers
          const headers = sortedFields.map(field => field.name || field.label || field.id);
          const headerRow = worksheet.addRow(headers);
          
          // Style the header row
          headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE0E0E0' }
            };
          });

          // Add data rows
          for (const record of records) {
            const row = [];
            for (const field of sortedFields) {
              const value = record.recordValues.find(v => v.field_id === field.id);
              row.push(value ? value.value : '');
            }
            worksheet.addRow(row);
          }

          // Auto-fit columns
          worksheet.columns.forEach(column => {
            column.width = 15;
          });
        } catch (error) {
          console.error(`Error processing directory ${directoryId}:`, error);
          // Continue with other directories even if one fails
        }
      }

      // Generate file
      const fileName = `${draft.company.name}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filePath = path.join(__dirname, '../uploads/excel-reports', fileName);
      
      // Ensure upload directory exists
      const uploadDir = path.dirname(filePath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      await workbook.xlsx.writeFile(filePath);

      // Send file
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up file after sending
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 1000);
      });

    } catch (error) {
      console.error('Error generating Excel file:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate Excel file'
      });
    }
  }

  // Upload configured Excel file
  async uploadConfiguredFile(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const draft = await ExcelReportTemplate.findByPk(id);
      if (!draft) {
        return res.status(404).json({
          success: false,
          error: 'Excel report template not found'
        });
      }

      // Delete old file if exists
      if (draft.uploaded_file_path && fs.existsSync(draft.uploaded_file_path)) {
        fs.unlinkSync(draft.uploaded_file_path);
      }

      // Update draft with new file info
      await draft.update({
        uploaded_file_path: req.file.path,
        uploaded_file_name: req.file.originalname,
        uploaded_at: new Date(),
        uploaded_by: userId,
        status: 'configured'
      });

      res.json({
        success: true,
        data: draft,
        message: 'Configured file uploaded successfully'
      });

    } catch (error) {
      console.error('Error uploading configured file:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload configured file'
      });
    }
  }

  // Download configured file
  async downloadConfiguredFile(req, res) {
    try {
      const { id } = req.params;

      const draft = await ExcelReportTemplate.findByPk(id);
      if (!draft) {
        return res.status(404).json({
          success: false,
          error: 'Excel report template not found'
        });
      }

      if (!draft.uploaded_file_path || !fs.existsSync(draft.uploaded_file_path)) {
        return res.status(404).json({
          success: false,
          error: 'Configured file not found'
        });
      }

      res.download(draft.uploaded_file_path, draft.uploaded_file_name);

    } catch (error) {
      console.error('Error downloading configured file:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download configured file'
      });
    }
  }
}

module.exports = {
  ExcelReportTemplateController: new ExcelReportTemplateController(),
  upload
};
