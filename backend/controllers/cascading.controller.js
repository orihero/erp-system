const { Sequelize } = require('sequelize');

// Get cascading configuration for a specific field value
const getCascadingConfig = async (req, res) => {
  try {
    const { DirectoryRecord } = require('../models');
    const { directoryId, fieldId, value } = req.query;

    console.log('🔍 Cascading Config Debug - Request params:', { directoryId, fieldId, value });

    if (!directoryId || !fieldId || !value) {
      return res.status(400).json({
        success: false,
        message: 'Directory ID, field ID, and value are required'
      });
    }

    // Find the directory record by its ID (the value parameter is actually the record ID)
    const directoryRecord = await DirectoryRecord.findByPk(value);
    
    console.log('🔍 Cascading Config Debug - Found record:', directoryRecord ? {
      id: directoryRecord.id,
      metadata: directoryRecord.metadata
    } : 'Not found');

    if (!directoryRecord) {
      // Let's also check if there are any records at all
      const allRecords = await DirectoryRecord.findAll({ limit: 5 });
      console.log('🔍 Cascading Config Debug - Available records:', allRecords.map(r => ({
        id: r.id,
        metadata: r.metadata
      })));
      
      return res.status(404).json({
        success: false,
        message: 'Directory record not found',
        debug: {
          requestedId: value,
          availableRecords: allRecords.length
        }
      });
    }

    const cascadingConfig = directoryRecord.getCascadingConfig();
    
    console.log('🔍 Cascading Config Debug - Cascading config:', cascadingConfig);
    console.log('🔍 Cascading Config Debug - Record metadata:', directoryRecord.metadata);
    
    if (!cascadingConfig || !cascadingConfig.enabled) {
      console.log('🔍 Cascading Config Debug - Cascading disabled or no config');
      return res.json({
        success: true,
        data: {
          enabled: false,
          dependentFields: []
        }
      });
    }

    console.log('🔍 Cascading Config Debug - Returning cascading config:', cascadingConfig);

    res.json({
      success: true,
      data: cascadingConfig
    });
  } catch (error) {
    console.error('Error getting cascading config:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get filtered directory records based on parent field value
const getFilteredRecords = async (req, res) => {
  try {
    const { DirectoryRecord } = require('../models');
    const { directoryId, parentField, parentValue } = req.query;

    if (!directoryId) {
      return res.status(400).json({
        success: false,
        message: 'Directory ID is required'
      });
    }

    let whereClause = {
      directory_id: directoryId
    };

    // Add parent field filtering if provided
    if (parentField && parentValue) {
      whereClause.metadata = {
        [parentField]: parentValue
      };
    }

    const records = await DirectoryRecord.findAll({
      where: whereClause,
      attributes: ['id', 'metadata', 'created_at', 'updated_at']
    });

    // Transform records to include name and value from metadata
    const transformedRecords = records.map(record => ({
      id: record.id,
      name: record.metadata?.name || 'Unknown',
      value: record.metadata?.value || record.id,
      metadata: record.metadata,
      created_at: record.created_at,
      updated_at: record.updated_at
    }));

    res.json({
      success: true,
      data: transformedRecords
    });
  } catch (error) {
    console.error('Error getting filtered records:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all cascading directories
const getCascadingDirectories = async (req, res) => {
  try {
    const { Directory } = require('../models');

    const directories = await Directory.findAll({
      where: {
        metadata: {
          cascadingEnabled: true
        }
      },
      attributes: ['id', 'name', 'icon_name', 'directory_type', 'metadata']
    });

    res.json({
      success: true,
      data: directories
    });
  } catch (error) {
    console.error('Error getting cascading directories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update cascading configuration for a directory record
const updateCascadingConfig = async (req, res) => {
  try {
    const { DirectoryRecord } = require('../models');
    const { recordId } = req.params;
    const { cascadingConfig } = req.body;

    if (!cascadingConfig) {
      return res.status(400).json({
        success: false,
        message: 'Cascading configuration is required'
      });
    }

    const record = await DirectoryRecord.findByPk(recordId);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Directory record not found'
      });
    }

    // Update metadata with new cascading configuration
    const updatedMetadata = {
      ...record.metadata,
      cascadingConfig
    };

    await record.update({
      metadata: updatedMetadata
    });

    res.json({
      success: true,
      data: record,
      message: 'Cascading configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating cascading config:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Validate cascading selection
const validateCascadingSelection = async (req, res) => {
  try {
    const { DirectoryRecord } = require('../models');
    const { selections } = req.body;

    if (!selections || !Array.isArray(selections)) {
      return res.status(400).json({
        success: false,
        message: 'Selections array is required'
      });
    }

    const validationResults = [];

    for (const selection of selections) {
      const { fieldName, value, parentField, parentValue } = selection;

      // Check if the selection is valid based on parent value
      if (parentField && parentValue) {
        const record = await DirectoryRecord.findOne({
          where: {
            metadata: {
              [parentField]: parentValue,
              value: value
            }
          }
        });

        validationResults.push({
          fieldName,
          value,
          isValid: !!record,
          message: record ? 'Valid selection' : 'Invalid selection for parent value'
        });
      } else {
        validationResults.push({
          fieldName,
          value,
          isValid: true,
          message: 'Valid selection (no parent dependency)'
        });
      }
    }

    const isValid = validationResults.every(result => result.isValid);

    res.json({
      success: true,
      data: {
        isValid,
        results: validationResults
      }
    });
  } catch (error) {
    console.error('Error validating cascading selection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Save cascading field values
const saveCascadingValues = async (req, res) => {
  try {
    const { DirectoryRecord, DirectoryField, DirectoryValue } = require('../models');
    const { 
      companyDirectoryId, 
      parentFieldId, 
      parentValue, 
      cascadingSelections 
    } = req.body;

    if (!companyDirectoryId || !parentFieldId || !parentValue || !cascadingSelections) {
      return res.status(400).json({
        success: false,
        message: 'Company directory ID, parent field ID, parent value, and cascading selections are required'
      });
    }

    // Create the main record with parent field value
    const mainRecord = await DirectoryRecord.create({
      company_directory_id: companyDirectoryId,
      metadata: {
        parentFieldId,
        parentValue,
        isCascadingRecord: true
      }
    });

    const createdFields = [];
    const createdValues = [];

    // Create directory values for each cascading selection
    for (const selection of cascadingSelections) {
      const { fieldName, value, displayName } = selection;

      // Create or find the dynamic field
      let dynamicField = await DirectoryField.findOne({
        where: {
          directory_id: companyDirectoryId,
          name: fieldName
        }
      });

      if (!dynamicField) {
        dynamicField = await DirectoryField.create({
          directory_id: companyDirectoryId,
          name: fieldName,
          type: 'string',
          required: false
        });
      }

      createdFields.push(dynamicField);

      // Create the directory value
      const directoryValue = await DirectoryValue.create({
        directory_record_id: mainRecord.id,
        field_id: dynamicField.id,
        value: value
      });

      createdValues.push(directoryValue);
    }

    res.json({
      success: true,
      data: {
        record: mainRecord,
        fields: createdFields,
        values: createdValues
      },
      message: 'Cascading values saved successfully'
    });

  } catch (error) {
    console.error('Error saving cascading values:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get cascading field values for a record
const getCascadingValues = async (req, res) => {
  try {
    const { DirectoryRecord, DirectoryValue, DirectoryField } = require('../models');
    const { recordId } = req.params;

    const record = await DirectoryRecord.findByPk(recordId, {
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

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Check if this is a cascading record
    if (!record.metadata?.isCascadingRecord) {
      return res.json({
        success: true,
        data: {
          isCascadingRecord: false,
          parentField: null,
          dependentValues: [],
          cascadingConfig: null
        }
      });
    }

    // Get parent field and dependent values
    const parentField = record.recordValues.find(value => 
      value.field_id === record.metadata.parentFieldId
    );
    
    const dependentValues = record.recordValues.filter(value => 
      value.field_id !== record.metadata.parentFieldId
    );

    res.json({
      success: true,
      data: {
        isCascadingRecord: true,
        parentField,
        dependentValues,
        cascadingConfig: record.getCascadingConfig()
      }
    });

  } catch (error) {
    console.error('Error getting cascading values:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Store cascading values for a directory record
const storeCascadingValues = async (req, res) => {
  try {
    const { DirectoryRecord, DirectoryValue, DirectoryField, CompanyDirectory } = require('../models');
    const { companyDirectoryId, parentFieldId, parentValue, cascadingSelections, metadata } = req.body;

    if (!companyDirectoryId || !parentFieldId || !parentValue) {
      return res.status(400).json({
        success: false,
        message: 'Company directory ID, parent field ID, and parent value are required'
      });
    }

    // Get the company directory to access directory_id
    const companyDirectory = await CompanyDirectory.findByPk(companyDirectoryId);
    if (!companyDirectory) {
      return res.status(404).json({
        success: false,
        message: 'Company directory not found'
      });
    }

    // Create the main directory record
    const record = await DirectoryRecord.create({
      company_directory_id: companyDirectoryId,
      metadata: {
        parentFieldId,
        parentValue,
        cascadingSelections,
        ...metadata
      }
    });

    // Create directory values for the main record and cascading selections
    const valuesToCreate = [
      {
        directory_record_id: record.id,
        field_id: parentFieldId,
        value: parentValue,
        metadata: {
          isParentField: true
        }
      }
    ];

    // Add cascading field values
    if (cascadingSelections && Array.isArray(cascadingSelections)) {
      for (const selection of cascadingSelections) {
        // Find or create the cascading field
        let cascadingField = await DirectoryField.findOne({
          where: {
            directory_id: companyDirectory.directory_id,
            name: selection.fieldName
          }
        });
        
        if (!cascadingField) {
          // Create the cascading field
          cascadingField = await DirectoryField.create({
            directory_id: companyDirectory.directory_id,
            name: selection.fieldName,
            type: 'string',
            required: false,
            metadata: {
              isCascadingField: true,
              parentFieldId: parentFieldId
            }
          });
        }
        
        valuesToCreate.push({
          directory_record_id: record.id,
          field_id: cascadingField.id,
          value: selection.value,
          metadata: {
            isCascadingField: true,
            parentField: parentFieldId,
            displayName: selection.displayName,
            fieldName: selection.fieldName
          }
        });
      }
    }

    await DirectoryValue.bulkCreate(valuesToCreate);

    res.json({
      success: true,
      data: {
        recordId: record.id,
        message: 'Cascading values stored successfully'
      }
    });
  } catch (error) {
    console.error('Error storing cascading values:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get cascading values for a specific record
const getCascadingValuesForRecord = async (req, res) => {
  try {
    const { DirectoryRecord, DirectoryValue } = require('../models');
    const { recordId } = req.params;

    const record = await DirectoryRecord.findByPk(recordId, {
      include: [{
        model: DirectoryValue,
        as: 'recordValues'
      }]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    const metadata = record.metadata || {};
    const cascadingSelections = metadata.cascadingSelections || [];

    res.json({
      success: true,
      data: {
        parentFieldId: metadata.parentFieldId,
        parentValue: metadata.parentFieldValue,
        cascadingSelections,
        metadata
      }
    });
  } catch (error) {
    console.error('Error getting cascading values:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getCascadingConfig,
  getFilteredRecords,
  getCascadingDirectories,
  updateCascadingConfig,
  validateCascadingSelection,
  saveCascadingValues,
  getCascadingValues,
  storeCascadingValues,
  getCascadingValuesForRecord
}; 