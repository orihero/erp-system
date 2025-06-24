const { Sequelize } = require('sequelize');
const { User, UserRole, Permission, RolePermission, UserRoleAssignment } = require('./models');

const sequelize = new Sequelize('erp_db', 'postgres', 'asdf12345', {
  host: '127.0.0.1',
  dialect: 'postgres'
});

async function testDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Check if super admin user exists
    const superAdmin = await User.findOne({
      where: { email: 'superadmin@demo.com' }
    });
    console.log('Super admin user:', superAdmin ? { id: superAdmin.id, email: superAdmin.email } : 'Not found');

    if (superAdmin) {
      // Check user role assignments
      const roleAssignments = await UserRoleAssignment.findAll({
        where: { user_id: superAdmin.id },
        include: [{
          model: UserRole,
          as: 'role'
        }]
      });
      console.log('Role assignments:', roleAssignments.map(ra => ({ role: ra.role.name, company_id: ra.company_id })));

      // Check permissions
      const permissions = await Permission.findAll();
      console.log('Total permissions:', permissions.length);
      console.log('Permission names:', permissions.map(p => p.name));

      // Check role permissions for super admin role
      const superAdminRole = await UserRole.findOne({
        where: { name: 'super_admin' }
      });
      if (superAdminRole) {
        const rolePermissions = await RolePermission.findAll({
          where: { role_id: superAdminRole.id },
          include: [{
            model: Permission,
            as: 'permission'
          }]
        });
        console.log('Super admin role permissions:', rolePermissions.map(rp => rp.permission.name));
      }
    }

  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabase(); 