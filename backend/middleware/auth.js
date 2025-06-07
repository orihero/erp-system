const jwt = require('jsonwebtoken');
const UserFactory = require('../factories/UserFactory');
const models = require('../models');

const userFactory = new UserFactory(models);

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
  authorizeCompanyAccess
}; 