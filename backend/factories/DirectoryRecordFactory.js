const {
  DirectoryRecord,
  DirectoryValue,
  CompanyDirectory,
  DirectoryField,
} = require("../models");
const { Op } = require("sequelize");

class DirectoryRecordFactory {
  static async createRecord(companyDirectoryId, values) {
    // Validate that the company directory exists
    const companyDirectory = await CompanyDirectory.findByPk(
      companyDirectoryId
    );
    if (!companyDirectory) {
      throw new Error("Company Directory not found");
    }

    // Create the record and its values in a transaction
    return await DirectoryRecord.sequelize.transaction(async (t) => {
      console.log('Attempting to create DirectoryRecord with company_directory_id:', companyDirectoryId);
      const record = await DirectoryRecord.create(
        {
          company_directory_id: companyDirectoryId,
        },
        { transaction: t }
      );
      console.log('DirectoryRecord created successfully:', record.id);

      if (values && values.length > 0) {
        console.log('Attempting to create DirectoryValue records for DirectoryRecord:', record.id);
        console.log('Values to be created:', values.map((v) => ({
          directory_record_id: record.id,
          directory_field_id: v.field_id,
          value: v.value,
        })));
        try {
          await DirectoryValue.bulkCreate(
            values.map((v) => ({
              directory_record_id: record.id,
              field_id: v.field_id, // Handle both attribute_id and fieldId for compatibility
              value: v.value,
            })),
            { 
              transaction: t,
              returning: ['id', 'directory_record_id', 'field_id', 'value', 'created_at', 'updated_at']
            }
          );
          console.log('DirectoryValue records created successfully for DirectoryRecord:', record.id);
        } catch (error) {
          console.error('Error creating DirectoryValue records:', error.message);
          throw error; // Re-throw to ensure the transaction rolls back
        }
      }

      return record;
    });
  }

  static async getRecordsByDirectory(companyDirectoryId, options = {}) {
    const { page = 1, limit = 10, search = "" } = options;
    const offset = (page - 1) * limit;

    const recordWhere = {
      company_directory_id: companyDirectoryId
    };

    const include = [
      {
        model: DirectoryValue,
        as: "recordValues",
        include: [
          {
            model: DirectoryField,
            as: "field",
          },
        ],
        // This makes the join a LEFT JOIN.
        required: false,
      },
    ];

    if (search) {
      // This `where` clause on the include effectively turns the LEFT JOIN
      // into an INNER JOIN for filtering purposes. This is usually desired.
      // It means: "find records where a related value matches the search".
      include[0].where = {
        value: {
          [Op.iLike]: `%${search}%`,
        },
      };
      // If you are filtering based on an included model, you should also set 'required' to true
      // to ensure the parent model is filtered correctly.
      include[0].required = true;
    }

    const { count, rows } = await DirectoryRecord.findAndCountAll({
      where: recordWhere,
      include: [
        {
          model: DirectoryValue,
          as: "recordValues",
          include: [
            {
              model: DirectoryField,
              as: "field",
            },
          ],
          required: false,
          separate: true, // Отдельный запрос для DirectoryValue
          where: search ? { value: { [Op.iLike]: `%${search}%` } } : undefined,
        },
      ],
    });

    return {
      records: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  static async getRecordById(id) {
    return await DirectoryRecord.findByPk(id, {
      include: [
        {
          model: DirectoryValue,
          as: "recordValues",
        },
      ],
    });
  }

  static async updateRecord(id, values) {
    const record = await DirectoryRecord.findByPk(id);
    if (!record) {
      throw new Error("Directory Record not found");
    }

    return await DirectoryRecord.sequelize.transaction(async (t) => {
      if (values && values.length > 0) {
        // Delete existing values
        await DirectoryValue.destroy({
          where: { directory_record_id: record.id },
          transaction: t,
        });

        // Create new values
        await DirectoryValue.bulkCreate(
          values.map((v) => ({
            directory_record_id: record.id,
            directory_field_id: v.attribute_id || v.fieldId, // Handle both attribute_id and fieldId for compatibility
            value: v.value,
          })),
          { transaction: t }
        );
      }

      return record;
    });
  }

  static async deleteRecord(id) {
    const record = await DirectoryRecord.findByPk(id);
    if (!record) {
      throw new Error("Directory Record not found");
    }

    return await record.destroy();
  }
}

module.exports = DirectoryRecordFactory;
