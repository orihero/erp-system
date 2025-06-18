const jwt = require('jsonwebtoken');
const UserFactory = require('../factories/UserFactory');
const models = require('../models');
const { User, UserRole, Permission, RolePermission, Module, Directory } = models;

const userFactory = new UserFactory(models);

// Middleware to verify JWT token and fetch user with roles and permissions
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user with all required associations
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: UserRole,
        as: 'roles',
        through: { attributes: [] },
        include: [{
          model: Permission,
          as: 'permissions',
          through: { 
            model: RolePermission,
            attributes: ['effective_from', 'effective_until', 'constraint_data']
          },
          include: [
            {
              model: Module,
              as: 'module',
              attributes: ['id', 'name']
            },
            {
              model: Directory,
              as: 'directory',
              attributes: ['id', 'name']
            }
          ]
        }]
      }]
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Flatten permissions from roles into a single array
    const flattenedPermissions = user.roles.reduce((acc, role) => {
      const rolePermissions = role.permissions.map(permission => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        type: permission.type,
        module_id: permission.module_id,
        directory_id: permission.directory_id,
        effective_from: permission.RolePermission.effective_from,
        effective_until: permission.RolePermission.effective_until,
        constraint_data: permission.RolePermission.constraint_data
      }));
      return [...acc, ...rolePermissions];
    }, []);

    // Assign user and permissions to request object
    req.user = user;
    req.user.permissions = flattenedPermissions;
    
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(req.user);
    next();
  } catch (error) {
    console.error('Error authenticating token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check user role
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userRoles = await UserFactory.getUserRoles(req.user.id, req.user.company_id);
      const hasRole = userRoles.some(role => allowedRoles.includes(role.name));
      console.log(userRoles);
      console.log(allowedRoles);
      console.log(hasRole);
      if (!hasRole) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Error checking role:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware to check company access
const authorizeCompanyAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Super admin can access all companies
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Other roles can only access their own company
  if (!req.user.company_id) {
    return res.status(403).json({ error: 'No company associated with user' });
  }

  next();
};

module.exports = {
  authenticateToken,
  checkRole,
  authorizeCompanyAccess,
  authenticateUser
}; 