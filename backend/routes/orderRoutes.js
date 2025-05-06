const express = require('express');
const {
    addOrderItems,
    getOrderById,
    getMyOrders,
    updateOrderToPaid,
    updateOrderToDelivered,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes specific to the logged-in user
router.route('/')
    .post(protect, addOrderItems) // Any logged-in user can create an order
    .get(protect, authorize('admin'), getAllOrders); // Only admin can get all orders

router.route('/myorders')
    .get(protect, getMyOrders); // Logged-in user gets their own orders

// Routes involving specific order ID
router.route('/:id')
    .get(protect, getOrderById); // Order owner or admin can get by ID (checked in controller)

router.route('/:id/pay')
    .put(protect, authorize('admin'), updateOrderToPaid); // Simplified: Admin marks as paid
    // In real app, might need a separate webhook route or different auth

router.route('/:id/deliver')
    // Allow admin or farmer to mark as delivered (can refine access control later)
    .put(protect, authorize('admin', 'farmer'), updateOrderToDelivered);

// Route for updating order status (e.g., Processing, Shipped)
router.route('/:id/status')
    .put(protect, authorize('admin', 'farmer'), updateOrderStatus);

module.exports = router;
