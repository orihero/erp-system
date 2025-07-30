'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
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
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
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
        },
        onDelete: 'CASCADE'
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
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
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
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
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
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
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
