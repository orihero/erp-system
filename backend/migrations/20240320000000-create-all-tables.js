'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create companies table
    await queryInterface.createTable('companies', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      admin_email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      employee_count: {
        type: Sequelize.ENUM('less_than_10', '10_to_50', '50_to_100', '100_to_500', '500_to_1000'),
        allowNull: false
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tax_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      registration_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      industry: {
        type: Sequelize.STRING,
        allowNull: true
      },
      founded_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      contacts: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create user_roles table
    await queryInterface.createTable('user_roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_super_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create modules table
    await queryInterface.createTable('modules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create directories table
    await queryInterface.createTable('directories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      icon_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create permissions table
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      module_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'modules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      directory_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'directories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      effective_from: {
        type: Sequelize.DATE,
        allowNull: true
      },
      effective_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      constraint_data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create role_permissions table
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      role_id: {
        type: Sequelize.UUID,
        references: {
          model: 'user_roles',
          key: 'id'
        },
        allowNull: false
      },
      permission_id: {
        type: Sequelize.UUID,
        references: {
          model: 'permissions',
          key: 'id'
        },
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
    await queryInterface.addConstraint('role_permissions', {
      fields: ['role_id', 'permission_id'],
      type: 'unique',
      name: 'unique_role_permission'
    });

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false
      },
      company_id: {
        type: Sequelize.UUID,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      last_login: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create user_role_assignments table
    await queryInterface.createTable('user_role_assignments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      },
      role_id: {
        type: Sequelize.UUID,
        references: {
          model: 'user_roles',
          key: 'id'
        },
        allowNull: false
      },
      company_id: {
        type: Sequelize.UUID,
        references: {
          model: 'companies',
          key: 'id'
        },
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create directory_fields table
    await queryInterface.createTable('directory_fields', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      directory_id: {
        type: Sequelize.UUID,
        references: {
          model: 'directories',
          key: 'id'
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      relation_id: {
        type: Sequelize.UUID,
        references: {
          model: 'directories',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create company_directories table
    await queryInterface.createTable('company_directories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      company_id: {
        type: Sequelize.UUID,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      directory_id: {
        type: Sequelize.UUID,
        references: {
          model: 'directories',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create directory_values table
    await queryInterface.createTable('directory_values', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      company_directory_id: {
        type: Sequelize.UUID,
        references: {
          model: 'company_directories',
          key: 'id'
        }
      },
      field_id: {
        type: Sequelize.UUID,
        references: {
          model: 'directory_fields',
          key: 'id'
        }
      },
      value: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order of dependencies
    await queryInterface.dropTable('directory_values');
    await queryInterface.dropTable('directory_records');
    await queryInterface.dropTable('directory_fields');
    await queryInterface.dropTable('company_directories');
    await queryInterface.dropTable('company_modules');
    await queryInterface.dropTable('user_role_assignments');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('report_structures');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('directories');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('companies');
  }
};
