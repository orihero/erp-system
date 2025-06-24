// Permission types
const PERMISSION_TYPES = {
  CREATE: 'create',
  READ: 'read',
  EDIT: 'edit',
  DELETE: 'delete',
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// Entity types
const ENTITY_TYPES = {
  COMPANY: 'company',
  COMPANY_DIRECTORY: 'company_directory',
  DIRECTORY: 'directory',
  DIRECTORY_RECORD: 'directory_record',
  REPORT_STRUCTURE: 'report_structure',
  USER: 'user',
};

module.exports = {
  PERMISSION_TYPES,
  USER_ROLES,
  ENTITY_TYPES,
}; 