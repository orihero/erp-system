const superAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
  }
  next();
};

module.exports = superAdmin; 