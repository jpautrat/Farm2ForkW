// controllers/paymentController.js
require('dotenv').config(); // Ensure env variables are loaded
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/Cart'); // Import Cart model
const Product = require('../models/Product'); // Import Product model (though populated via Cart)

// Helper function to calculate amount securely
const calculateOrderAmountSecurely = async (userId) => {
    // Fetch the user's cart, populating product details to get current prices
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
        // Return 0 or throw an error if the cart is empty
        return 0; 
    }

    let totalAmount = 0;
    for (const item of cart.items) {
        if (!item.product || item.product.price === undefined) {
            // Handle cases where product data is missing or price isn't set
            console.error(`Product data missing or invalid price for product ID: ${item.productId} in cart for user: ${userId}`);
            // Decide how to handle this: skip item, throw error, etc.
            // Throwing an error is safer to prevent incorrect charges.
            throw new Error(`Invalid product data found in cart.`);
        }
        totalAmount += item.product.price * item.quantity;
    }
    
    // TODO: Add logic for tax and shipping if applicable to the payment intent amount
    const taxPrice = 0; // Placeholder
    const shippingPrice = totalAmount > 100 ? 0 : 10; // Placeholder
    const finalTotal = totalAmount + taxPrice + shippingPrice;

    // Return amount in the smallest currency unit (e.g., cents for USD)
    return Math.round(finalTotal * 100); 
};

exports.createPaymentIntent = async (req, res) => {
    // Removed amount from req.body - Calculate server-side
    const userId = req.user.id; // Assuming authMiddleware adds user to req

    try {
        // Calculate the final amount securely on the backend
        const finalAmount = await calculateOrderAmountSecurely(userId);

        // Basic validation for calculated amount
        if (finalAmount <= 0) {
            return res.status(400).json({ message: 'Cannot create payment for an empty cart or zero amount.' });
        }

        // Create a PaymentIntent with the *server-calculated* order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmount,
            currency: 'usd', // Or your desired currency
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter
            // is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
            // Optionally add metadata (like user ID, cart ID) if needed
            metadata: { userId: req.user.id },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe Payment Intent Error:', error);
        res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
    }
};
