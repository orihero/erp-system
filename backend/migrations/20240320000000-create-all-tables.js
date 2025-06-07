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
      is_system: {
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
      module: {
        type: Sequelize.STRING,
        allowNull: false
      },
      action: {
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

    // Create modules table
    await queryInterface.createTable('modules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
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
    await queryInterface.dropTable('directory_values');
    await queryInterface.dropTable('company_directories');
    await queryInterface.dropTable('directory_fields');
    await queryInterface.dropTable('directories');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('user_role_assignments');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('companies');
  }
}; 