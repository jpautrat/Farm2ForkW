// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Protect the endpoint

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', authMiddleware, paymentController.createPaymentIntent);

module.exports = router;
