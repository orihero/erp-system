const { Sequelize } = require('sequelize');
const config = require('../config/config.json');

const sequelize = new Sequelize(config.development);

async function verifyPermissionPermissions() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get super admin role
    const superAdminRole = await sequelize.query(
      'SELECT * FROM user_roles WHERE name = ?;',
      { 
        replacements: ['super_admin'],
        type: Sequelize.QueryTypes.SELECT 
      }
    );

    if (!superAdminRole || superAdminRole.length === 0) {
      console.log('Super admin role not found');
      return;
    }

    const roleId = superAdminRole[0].id;
    console.log(`Super admin role ID: ${roleId}`);

    // Get permission management permissions for super admin
    const permissionPermissions = await sequelize.query(
      `SELECT p.name, p.description, rp.role_id 
       FROM permissions p 
       JOIN role_permissions rp ON p.id = rp.permission_id 
       WHERE rp.role_id = ? AND p.name LIKE 'permissions.%'
       ORDER BY p.name;`,
      { 
        replacements: [roleId],
        type: Sequelize.QueryTypes.SELECT 
      }
    );

    console.log('\nPermission management permissions for super admin:');
    permissionPermissions.forEach(perm => {
      console.log(`- ${perm.name}: ${perm.description}`);
    });

    // Get role permission management permissions for super admin
    const rolePermissionPermissions = await sequelize.query(
      `SELECT p.name, p.description, rp.role_id 
       FROM permissions p 
       JOIN role_permissions rp ON p.id = rp.permission_id 
       WHERE rp.role_id = ? AND p.name LIKE 'role_permissions.%'
       ORDER BY p.name;`,
      { 
        replacements: [roleId],
        type: Sequelize.QueryTypes.SELECT 
      }
    );

    console.log('\nRole permission management permissions for super admin:');
    rolePermissionPermissions.forEach(perm => {
      console.log(`- ${perm.name}: ${perm.description}`);
    });

    console.log(`\nTotal permission management permissions: ${permissionPermissions.length}`);
    console.log(`Total role permission management permissions: ${rolePermissionPermissions.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyPermissionPermissions(); 