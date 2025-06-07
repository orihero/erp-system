const { DirectoryType, DirectoryAttribute, Company, DirectoryEntry, DirectoryEntryValue } = require('../models');
const { Op } = require('sequelize');

class DirectoryFactory {
  static async createDirectory(data) {
    const { name, attributes } = data;
    
    return await DirectoryType.create({
      name,
      attributes: attributes.map(attr => ({
        name: attr.name,
        data_type: attr.data_type,
        relation_type_id: attr.relation_type_id
      }))
    }, {
      include: [{
        model: DirectoryAttribute,
        as: 'attributes'
      }]
    });
  }

  static async assignDirectoryToCompany(companyId, directoryTypeId) {
    const company = await Company.findByPk(companyId);
    const directoryType = await DirectoryType.findByPk(directoryTypeId);

    if (!company || !directoryType) {
      throw new Error('Company or Directory Type not found');
    }

    await company.addDirectory_type(directoryType);
    return directoryType;
  }

  static async createDirectoryEntry(directoryTypeId, companyId, values) {
    const directoryType = await DirectoryType.findByPk(directoryTypeId, {
      include: [{
        model: DirectoryAttribute,
        as: 'attributes'
      }]
    });

    if (!directoryType) {
      throw new Error('Directory Type not found');
    }

    // Validate that all required attributes are provided
    const requiredAttributes = directoryType.attributes.filter(attr => !attr.allowNull);
    const providedAttributeIds = values.map(v => v.attribute_id);
    
    for (const attr of requiredAttributes) {
      if (!providedAttributeIds.includes(attr.id)) {
        throw new Error(`Missing required attribute: ${attr.name}`);
      }
    }

    // Create entry and values in a transaction
    return await DirectoryEntry.sequelize.transaction(async (t) => {
      const entry = await DirectoryEntry.create({
        directory_type_id: directoryTypeId,
        company_id: companyId
      }, { transaction: t });

      await DirectoryEntryValue.bulkCreate(
        values.map(v => ({
          entry_id: entry.id,
          attribute_id: v.attribute_id,
          value: v.value
        })),
        { transaction: t }
      );

      return entry;
    });
  }

  static async getDirectoryEntries(directoryTypeId, companyId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      filters = {}
    } = options;

    const offset = (page - 1) * limit;
    const where = {
      directory_type_id: directoryTypeId,
      company_id: companyId
    };

    // Add search condition if provided
    if (search) {
      where['$values.value$'] = {
        [Op.iLike]: `%${search}%`
      };
    }

    // Add filters
    if (Object.keys(filters).length > 0) {
      where['$values.attribute_id$'] = {
        [Op.in]: Object.keys(filters)
      };
      where['$values.value$'] = {
        [Op.in]: Object.values(filters)
      };
    }

    const { count, rows } = await DirectoryEntry.findAndCountAll({
      where,
      include: [{
        model: DirectoryEntryValue,
        as: 'values',
        include: [{
          model: DirectoryAttribute,
          as: 'attribute'
        }]
      }],
      offset,
      limit,
      distinct: true,
      order: [['created_at', 'DESC']]
    });

    return {
      entries: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async getDirectoryById(id, options = {}) {
    return await DirectoryType.findByPk(id, {
      include: [{
        model: DirectoryAttribute,
        as: 'attributes'
      }],
      ...options
    });
  }

  static async getDirectoriesByCompany(companyId, options = {}) {
    const company = await Company.findByPk(companyId, {
      include: [{
        model: DirectoryType,
        as: 'directory_types',
        include: [{
          model: DirectoryAttribute,
          as: 'attributes'
        }]
      }]
    });

    return company?.directory_types || [];
  }
}

module.exports = DirectoryFactory; 