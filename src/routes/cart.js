const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
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

// Consumer-only RBAC
function consumerOnly(req, res, next) {
  if (req.user.role !== 'consumer') return res.sendStatus(403);
  next();
}

router.get('/', authenticateToken, consumerOnly, cartController.getCart);
router.post('/', authenticateToken, consumerOnly, cartController.updateCart);
router.delete('/', authenticateToken, consumerOnly, cartController.deleteCart);

module.exports = router;
