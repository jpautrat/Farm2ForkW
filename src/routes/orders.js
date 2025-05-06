const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
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

// List orders (RBAC in controller)
router.get('/', authenticateToken, orderController.list);
// Get order by id
router.get('/:id', authenticateToken, orderController.get);
// Create order from cart
router.post('/', authenticateToken, orderController.create);

module.exports = router;
