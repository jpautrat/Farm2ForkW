// backend/routes/farmerRoutes.js
const express = require('express');
const { getMyProducts, getMySalesOrders } = require('../controllers/farmerController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming authorize middleware takes roles

const router = express.Router();

// Apply protect middleware to all routes below
router.use(protect);
// Apply authorize middleware (only 'farmer' role) to all routes below
router.use(authorize('farmer')); 

router.route('/products').get(getMyProducts);
router.route('/orders').get(getMySalesOrders);

module.exports = router;
