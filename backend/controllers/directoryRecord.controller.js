const DirectoryRecordFactory = require('../factories/DirectoryRecordFactory');

const directoryRecordController = {
  // Create a new directory record
  create: async (req, res) => {
    try {
      const { company_directory_id, values } = req.body;
      const record = await DirectoryRecordFactory.createRecord(company_directory_id, values);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all records for a specific directory
  getByDirectory: async (req, res) => {
    try {
      const { companyDirectoryId } = req.params;
      const { page, limit, search } = req.query;
      const result = await DirectoryRecordFactory.getRecordsByDirectory(companyDirectoryId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || ''
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get a single directory record
  getOne: async (req, res) => {
    try {
      const record = await DirectoryRecordFactory.getRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: 'Directory Record not found' });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a directory record
  update: async (req, res) => {
    try {
      const { values } = req.body;
      const record = await DirectoryRecordFactory.updateRecord(req.params.id, values);
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a directory record
  delete: async (req, res) => {
    try {
      await DirectoryRecordFactory.deleteRecord(req.params.id);
      res.json({ message: 'Directory Record deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Bulk delete directory records by group (filename)
  bulkDeleteByGroup: async (req, res) => {
    try {
      const { directory_id, company_id, groupValue } = req.query;
      
      if (!directory_id || !company_id || !groupValue) {
        return res.status(400).json({ 
          message: 'directory_id, company_id, and groupValue are required' 
        });
      }

      const { CompanyDirectory, Directory, DirectoryField, DirectoryRecord, DirectoryValue } = require('../models');
      
      // Find the company_directory
      const companyDirectory = await CompanyDirectory.findOne({
        where: { directory_id, company_id },
        include: [
          {
            model: Directory,
            as: 'directory',
            include: [{ model: DirectoryField, as: 'fields' }]
          }
        ]
      });

      if (!companyDirectory) {
        return res.status(404).json({ message: 'CompanyDirectory not found' });
      }

      // Get directory metadata for groupBy field
      const directory = companyDirectory.directory;
      const directoryMetadata = directory.metadata || {};
      const groupBy = directoryMetadata.groupBy;

      if (!groupBy) {
        return res.status(400).json({ 
          message: 'Directory does not have groupBy configuration' 
        });
      }

      // Find the groupBy field
      const fields = directory.fields || [];
      const groupByField = fields.find(f => f.name === groupBy);
      
      if (!groupByField) {
        return res.status(400).json({ 
          message: `GroupBy field '${groupBy}' not found in directory fields` 
        });
      }

      // Find all records that have the specified groupValue
      const recordsToDelete = await DirectoryRecord.findAll({
        where: { company_directory_id: companyDirectory.id },
        include: [
          {
            model: DirectoryValue,
            as: 'recordValues',
            where: {
              field_id: groupByField.id,
              value: groupValue
            },
            required: true
          }
        ]
      });

      if (recordsToDelete.length === 0) {
        return res.status(404).json({ 
          message: `No records found for group: ${groupValue}` 
        });
      }

      // Delete all records and their values
      const recordIds = recordsToDelete.map(record => record.id);
      
      // Delete directory values first (due to foreign key constraints)
      await DirectoryValue.destroy({
        where: {
          directory_record_id: recordIds
        }
      });

      // Delete directory records
      await DirectoryRecord.destroy({
        where: {
          id: recordIds
        }
      });

      res.json({
        message: `Successfully deleted ${recordsToDelete.length} records from group: ${groupValue}`,
        deletedCount: recordsToDelete.length,
        groupValue
      });

    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // New: Get all directory data, company_directory, and directory_records by directory_id and company_id
  getFullDirectoryData: async (req, res) => {
    try {
      const { directory_id, company_id, groupBy, search } = req.query;
      
      // Parse filters from query (filters[field_id:operator]=value)
      const filters = {};
      console.log('=== FILTER PARSING START ===');
      console.log('All query parameters:', req.query);
      
      // Check if filters are in req.query.filters object
      if (req.query.filters && typeof req.query.filters === 'object') {
        console.log('Found filters object:', req.query.filters);
        
        Object.keys(req.query.filters).forEach((filterKey) => {
          console.log(`Processing filter key: "${filterKey}"`);
          const [fieldId, operator] = filterKey.split(':');
          console.log(`  - Split into fieldId: "${fieldId}", operator: "${operator}"`);
          
          filters[fieldId] = {
            operator: operator || 'equals',
            value: req.query.filters[filterKey].trim() // Trim whitespace from the value
          };
          console.log(`  - Created filter:`, filters[fieldId]);
        });
      } else {
        // Fallback to old parsing method for direct query parameters
        Object.keys(req.query).forEach((key) => {
          console.log(`Processing query key: "${key}"`);
          if (key.startsWith('filters[') && key.endsWith(']')) {
            const filterKey = key.slice(8, -1);
            console.log(`  - Extracted filterKey: "${filterKey}"`);
            const [fieldId, operator] = filterKey.split(':');
            console.log(`  - Split into fieldId: "${fieldId}", operator: "${operator}"`);
            
            filters[fieldId] = {
              operator: operator || 'equals',
              value: req.query[key]
            };
            console.log(`  - Created filter:`, filters[fieldId]);
          } else {
            console.log(`  - Skipping non-filter key: "${key}"`);
          }
        });
      }
      
      console.log('Final parsed filters:', filters);
      console.log('=== FILTER PARSING END ===');
      
      // Parse sorting parameters from query (sort[0][field]=fieldName&sort[0][direction]=ASC)
      const sorting = [];
      Object.keys(req.query).forEach((key) => {
        const sortMatch = key.match(/^sort\[(\d+)\]\[(field|direction)\]$/);
        if (sortMatch) {
          const [, index, param] = sortMatch;
          const numIndex = parseInt(index);
          if (!sorting[numIndex]) {
            sorting[numIndex] = {};
          }
          sorting[numIndex][param] = req.query[key];
        }
      });
      
      console.log('Parsed sorting parameters:', sorting);
      
      if (!directory_id) {
        return res.status(400).json({ message: 'directory_id is required' });
      }

      // Special handling for super admin users with 'system' company_id or empty company_id
      const isSystemRequest = company_id === 'system' || company_id === '';
      
      if (!company_id && !isSystemRequest) {
        return res.status(400).json({ message: 'company_id is required' });
      }

      const { CompanyDirectory, Directory, DirectoryField, DirectoryRecord, DirectoryValue } = require('../models');
      
      let companyDirectory;
      
      if (isSystemRequest) {
        // For system requests (super admin), get the directory directly
        const directory = await Directory.findByPk(directory_id, {
          include: [{ model: DirectoryField, as: 'fields' }]
        });
        
        if (!directory) {
          return res.status(404).json({ message: 'Directory not found' });
        }
        
        // Create a mock company directory for system access
        companyDirectory = {
          id: `system-${directory_id}`,
          company_id: company_id || 'system',
          directory_id: directory_id,
          module_id: null,
          directory: directory
        };
      } else {
        // Find the company_directory
        console.log('Looking for CompanyDirectory with:', { directory_id, company_id });
        companyDirectory = await CompanyDirectory.findOne({
          where: { directory_id, company_id },
          include: [
            {
              model: Directory,
              as: 'directory',
              include: [{ model: DirectoryField, as: 'fields' }]
            }
          ]
        });
        
        console.log('CompanyDirectory found:', companyDirectory ? 'YES' : 'NO');
        if (companyDirectory) {
          console.log('CompanyDirectory ID:', companyDirectory.id);
        }
        
        // If CompanyDirectory doesn't exist, try to get the directory directly
        if (!companyDirectory) {
          console.log('CompanyDirectory not found, creating temporary one');
          const directory = await Directory.findByPk(directory_id, {
            include: [{ model: DirectoryField, as: 'fields' }]
          });
          
          if (!directory) {
            return res.status(404).json({ message: 'Directory not found' });
          }
          
          // Create a mock company directory for this case
          companyDirectory = {
            id: `temp-${directory_id}-${company_id}`,
            company_id: company_id,
            directory_id: directory_id,
            module_id: null,
            directory: directory
          };
        }
      }
      // Build include for DirectoryValue with filtering
      const valueInclude = {
        model: DirectoryValue,
        as: 'recordValues',
        include: [
          {
            model: DirectoryField,
            as: 'field'
          }
        ],
        required: false
      };
      // Filtering by field values with operators
      console.log('=== FILTER APPLICATION START ===');
      console.log('Filters to apply:', filters);
      console.log('Number of filters:', Object.keys(filters).length);
      
      if (Object.keys(filters).length > 0) {
        const filterConditions = Object.entries(filters).map(([field_id, filter]) => {
          const { operator, value } = filter;
          console.log(`Processing filter for field ${field_id}:`, { operator, value });
          
          let condition;
          switch (operator) {
            case 'contains':
              condition = {
                field_id,
                value: { [require('sequelize').Op.like]: `%${value}%` }
              };
              console.log(`  - Contains condition:`, condition);
              break;
            case 'equals':
              condition = { field_id, value };
              console.log(`  - Equals condition:`, condition);
              break;
            case 'is blank':
              condition = {
                field_id,
                value: { [require('sequelize').Op.or]: [null, ''] }
              };
              console.log(`  - Is blank condition:`, condition);
              break;
            case 'is not blank':
              condition = {
                field_id,
                value: { 
                  [require('sequelize').Op.and]: [
                    { [require('sequelize').Op.ne]: null },
                    { [require('sequelize').Op.ne]: '' }
                  ]
                }
              };
              console.log(`  - Is not blank condition:`, condition);
              break;
            default:
              condition = { field_id, value };
              console.log(`  - Default condition:`, condition);
              break;
          }
          return condition;
        });
        
        console.log('All filter conditions:', filterConditions);
        
        // Instead of filtering the valueInclude, we'll filter the main query
        // and include all values for the matching records
        valueInclude.required = false; // Don't require the filtered values to be present
        valueInclude.where = {}; // No filtering on the include itself
        
        console.log('Final valueInclude.where:', JSON.stringify(valueInclude.where, null, 2));
      } else {
        console.log('No filters to apply');
      }
      console.log('=== FILTER APPLICATION END ===');
      console.log('Final valueInclude object:', JSON.stringify(valueInclude, null, 2));
      
      // Debug: Let's see what actual data exists for the filtered field
      if (Object.keys(filters).length > 0) {
        console.log('=== DEBUG: CHECKING ACTUAL DATA ===');
        const fieldIds = Object.keys(filters);
        for (const fieldId of fieldIds) {
          const sampleData = await DirectoryValue.findAll({
            where: { field_id: fieldId },
            limit: 5,
            include: [
              {
                model: DirectoryField,
                as: 'field'
              }
            ]
          });
          console.log(`Sample data for field ${fieldId}:`, sampleData.map(d => ({ value: d.value, field_name: d.field?.name })));
        }
        console.log('=== END DEBUG ===');
      }
      
      // Sorting by field values with data type awareness
      let order = [['created_at', 'DESC']];
      let include = [valueInclude];
      
      if (sorting.length > 0) {
        // Get all fields to determine data types
        const fields = companyDirectory.directory?.fields || [];
        
        // Create sorting includes and order clauses
        const sortIncludes = [];
        const sortOrders = [];
        
        sorting.forEach((sort, index) => {
          if (sort.field && sort.direction) {
            console.log(`Processing sort ${index}:`, sort);
            
            // Find the field by name to get its ID and type
            const field = fields.find(f => f.name === sort.field);
            console.log(`Found field for "${sort.field}":`, field ? { id: field.id, type: field.type } : 'NOT FOUND');
            
            if (field) {
              // Create a separate include for this sort field
              const sortInclude = {
                model: DirectoryValue,
                as: `sortValue${index}`,
                required: false,
                where: { field_id: field.id },
              };
              sortIncludes.push(sortInclude);
              
              // Create order clause based on field type
              let orderClause;
              const direction = sort.direction.toUpperCase();
              
              switch (field.type) {
                case 'integer':
                case 'decimal':
                  // For numbers, cast to numeric for proper sorting
                  try {
                    orderClause = [
                      require('sequelize').literal(`CAST("sortValue${index}"."value" AS NUMERIC) ${direction}`)
                    ];
                    console.log(`Number sort clause for ${field.name}:`, orderClause);
                  } catch (error) {
                    console.log(`Error creating number sort clause for ${field.name}:`, error.message);
                    // Fallback to string sorting
                    orderClause = [
                      { model: DirectoryValue, as: `sortValue${index}` },
                      'value',
                      direction
                    ];
                  }
                  break;
                case 'date':
                case 'time':
                case 'datetime':
                  // For dates and times, cast to timestamp for proper sorting
                  try {
                    orderClause = [
                      require('sequelize').literal(`CAST("sortValue${index}"."value" AS TIMESTAMP) ${direction}`)
                    ];
                    console.log(`Date/time sort clause for ${field.name}:`, orderClause);
                  } catch (error) {
                    console.log(`Error creating date/time sort clause for ${field.name}:`, error.message);
                    // Fallback to string sorting
                    orderClause = [
                      { model: DirectoryValue, as: `sortValue${index}` },
                      'value',
                      direction
                    ];
                  }
                  break;
                case 'bool':
                  // For booleans, cast to boolean for proper sorting
                  try {
                    orderClause = [
                      require('sequelize').literal(`CAST("sortValue${index}"."value" AS BOOLEAN) ${direction}`)
                    ];
                    console.log(`Boolean sort clause for ${field.name}:`, orderClause);
                  } catch (error) {
                    console.log(`Error creating boolean sort clause for ${field.name}:`, error.message);
                    // Fallback to string sorting
                    orderClause = [
                      { model: DirectoryValue, as: `sortValue${index}` },
                      'value',
                      direction
                    ];
                  }
                  break;
                case 'json':
                  // For JSON, sort by the string representation
                  orderClause = [
                    { model: DirectoryValue, as: `sortValue${index}` },
                    'value',
                    direction
                  ];
                  console.log(`JSON sort clause for ${field.name}:`, orderClause);
                  break;
                case 'file':
                  // For files, sort by the file path/name
                  orderClause = [
                    { model: DirectoryValue, as: `sortValue${index}` },
                    'value',
                    direction
                  ];
                  console.log(`File sort clause for ${field.name}:`, orderClause);
                  break;
                case 'relation':
                  // For relations, sort by the related record ID or name
                  orderClause = [
                    { model: DirectoryValue, as: `sortValue${index}` },
                    'value',
                    direction
                  ];
                  console.log(`Relation sort clause for ${field.name}:`, orderClause);
                  break;
                default:
                  // For text and other types, use string comparison
                  orderClause = [
                    { model: DirectoryValue, as: `sortValue${index}` },
                    'value',
                    direction
                  ];
                  console.log(`Text sort clause for ${field.name}:`, orderClause);
                  break;
              }
              
              sortOrders.push(orderClause);
            } else {
              console.log(`Warning: Field "${sort.field}" not found in directory fields`);
            }
          }
        });
        
        // Add sort includes to the main include array
        include.push(...sortIncludes);
        
        // Set the order to use the sort orders, with fallback to created_at
        if (sortOrders.length > 0) {
          order = [...sortOrders, ['created_at', 'DESC']];
        } else {
          console.log('No valid sort orders found, using default order');
        }
        
        console.log('Applied sorting:', {
          sorting,
          order,
          includeCount: include.length
        });
      }
      // Get all directory records for this company_directory
      let directoryRecords = [];
      
      if (isSystemRequest) {
        // For system requests, return empty records since there's no company-specific data
        directoryRecords = [];
      } else {
        // Check if the company directory ID is a temporary one (starts with 'temp-')
        const isTemporaryCompanyDirectory = companyDirectory.id.startsWith('temp-');
        
        if (isTemporaryCompanyDirectory) {
          // For temporary company directories, return empty records since the directory isn't enabled for this company
          directoryRecords = [];
        } else {
          // Get all directory records for this company_directory
          let whereClause = { company_directory_id: companyDirectory.id };
          
          // Apply filters to the main query
          if (Object.keys(filters).length > 0) {
            console.log('=== APPLYING FILTERS TO MAIN QUERY ===');
            
            // Create a subquery to find records that match the filter conditions
            const filterConditions = Object.entries(filters).map(([field_id, filter]) => {
              const { operator, value } = filter;
              console.log(`Creating subquery condition for field ${field_id}:`, { operator, value });
              
              let condition;
              switch (operator) {
                case 'contains':
                  condition = {
                    field_id,
                    value: { [require('sequelize').Op.like]: `%${value}%` }
                  };
                  break;
                case 'equals':
                  condition = { field_id, value };
                  break;
                case 'is blank':
                  condition = {
                    field_id,
                    value: { [require('sequelize').Op.or]: [null, ''] }
                  };
                  break;
                case 'is not blank':
                  condition = {
                    field_id,
                    value: { 
                      [require('sequelize').Op.and]: [
                        { [require('sequelize').Op.ne]: null },
                        { [require('sequelize').Op.ne]: '' }
                      ]
                    }
                  };
                  break;
                default:
                  condition = { field_id, value };
                  break;
              }
              return condition;
            });
            
            console.log('Filter conditions for subquery:', filterConditions);
            
            // Add a subquery to filter records that have matching values
            whereClause.id = {
              [require('sequelize').Op.in]: require('sequelize').literal(`(
                SELECT DISTINCT directory_record_id 
                FROM directory_values 
                WHERE ${filterConditions.map((condition, index) => {
                  const fieldId = condition.field_id;
                  const valueCondition = condition.value;
                  if (valueCondition && typeof valueCondition === 'object' && valueCondition[require('sequelize').Op.like]) {
                    const likePattern = valueCondition[require('sequelize').Op.like];
                    return `(field_id = '${fieldId}' AND value LIKE '${likePattern}')`;
                  } else if (valueCondition && typeof valueCondition === 'object' && valueCondition[require('sequelize').Op.or]) {
                    return `(field_id = '${fieldId}' AND (value IS NULL OR value = ''))`;
                  } else if (valueCondition && typeof valueCondition === 'object' && valueCondition[require('sequelize').Op.and]) {
                    return `(field_id = '${fieldId}' AND value IS NOT NULL AND value != '')`;
                  } else {
                    return `(field_id = '${fieldId}' AND value = '${valueCondition}')`;
                  }
                }).join(' OR ')}
              )`)
            };
            
            console.log('Updated whereClause with filter subquery:', whereClause);
          }
          
          // Add search functionality
          if (search) {
            // Search in directory values
            const searchInclude = {
              model: DirectoryValue,
              as: 'recordValues',
              where: {
                value: {
                  [require('sequelize').Op.iLike]: `%${search}%`
                }
              },
              required: true,
              include: [
                {
                  model: DirectoryField,
                  as: 'field'
                }
              ]
            };
            
            // If we already have includes, merge them
            if (include.length > 0) {
              // Find the existing recordValues include and merge search conditions
              const existingInclude = include.find(inc => inc.as === 'recordValues');
              if (existingInclude) {
                existingInclude.where = {
                  [require('sequelize').Op.and]: [
                    existingInclude.where,
                    {
                      value: {
                        [require('sequelize').Op.iLike]: `%${search}%`
                      }
                    }
                  ]
                };
                existingInclude.required = true;
              } else {
                include.push(searchInclude);
              }
            } else {
              include = [searchInclude];
            }
          }
          
          console.log('=== QUERY EXECUTION START ===');
          console.log('Final query parameters:');
          console.log('  - whereClause:', whereClause);
          console.log('  - include:', JSON.stringify(include, null, 2));
          console.log('  - order:', order);
          console.log('  - includeCount:', include.length);
          
          directoryRecords = await DirectoryRecord.findAll({
            where: whereClause,
            include,
            order
          });
          
          console.log(`Query returned ${directoryRecords.length} records`);
          console.log('=== QUERY EXECUTION END ===');
        }
      }
      // Extract fields from directory and remove from directory and companyDirectory.directory
      const directory = companyDirectory.directory?.toJSON ? companyDirectory.directory.toJSON() : companyDirectory.directory;
      const fields = directory?.fields || [];
      if (directory) delete directory.fields;
      // Remove fields from companyDirectory.directory if present
      const companyDirectoryObj = companyDirectory.toJSON ? companyDirectory.toJSON() : companyDirectory;
      if (companyDirectoryObj.directory && companyDirectoryObj.directory.fields) {
        delete companyDirectoryObj.directory.fields;
      }
      // Grouping
      let grouped = null;
      if (groupBy && directoryRecords.length > 0) {
        grouped = {};
        for (const record of directoryRecords) {
          // Find the value for the groupBy field by field name or ID
          let valueObj = null;
          if (groupBy.includes('-')) {
            // If groupBy contains a dash, it's likely a field ID
            valueObj = (record.recordValues || []).find(v => v.field_id === groupBy);
          } else {
            // If groupBy is a field name, find the field first, then the value
            const field = fields.find(f => f.name === groupBy);
            if (field) {
              valueObj = (record.recordValues || []).find(v => v.field_id === field.id);
            }
          }
          const groupValue = valueObj ? valueObj.value : 'undefined';
          if (!grouped[groupValue]) grouped[groupValue] = [];
          grouped[groupValue].push(record);
        }
      }
      res.json({
        directory,
        companyDirectory: companyDirectoryObj,
        directoryRecords: grouped || directoryRecords,
        fields
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = directoryRecordController;
