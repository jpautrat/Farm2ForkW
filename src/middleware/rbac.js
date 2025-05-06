// Role-based access control middleware
module.exports.requireRole = function(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
};

// Ownership or admin check for product modification
const { Product } = require('../models');
module.exports.requireProductOwnerOrAdmin = async function(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role === 'admin' || (req.user.role === 'farmer' && product.farmer_id === req.user.id)) {
      req.product = product;
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: not owner or admin' });
  } catch (err) {
    next(err);
  }
};
