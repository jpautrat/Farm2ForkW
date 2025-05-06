const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireRole, requireProductOwnerOrAdmin } = require('../middleware/rbac');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Auth middleware (reuse from auth.js)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Public endpoints
router.get('/', productController.list);
router.get('/:id', productController.get);

// Protected endpoints (farmer/admin)
router.post('/', authenticateToken, requireRole(['farmer']), productController.create);
router.put('/:id', authenticateToken, requireRole(['farmer', 'admin']), requireProductOwnerOrAdmin, productController.update);
router.delete('/:id', authenticateToken, requireRole(['farmer', 'admin']), requireProductOwnerOrAdmin, productController.remove);

module.exports = router;
