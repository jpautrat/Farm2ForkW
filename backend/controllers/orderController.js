require('dotenv').config(); // Ensure env variables are loaded
const Order = require('../models/Order');
const Product = require('../models/Product'); // Needed for current prices & stock
const Cart = require('../models/Cart'); // Needed to fetch user's cart
const mongoose = require('mongoose'); // Needed for transactions
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order after successful payment verification
// @route   POST /api/orders
// @access  Private (Logged-in user)
exports.addOrderItems = async (req, res) => {
    const { shippingAddress, paymentIntentId } = req.body;
    const userId = req.user.id;

    // --- 1. Validate Input --- 
    if (!shippingAddress || !paymentIntentId) {
        return res.status(400).json({ message: 'Missing shipping address or payment intent ID' });
    }
    // TODO: Add more robust validation for shippingAddress fields

    // --- 2. Start Transaction (Requires MongoDB Replica Set) --- 
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // --- 3. Fetch User's Cart and Products within the transaction --- 
        const cart = await Cart.findOne({ user: userId }).populate('items.product').session(session);

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Cannot create order from empty cart' });
        }

        // --- 4. Calculate Total and Prepare Order Items (Server-Side) --- 
        let calculatedItemsPrice = 0;
        const orderItems = cart.items.map(item => {
            if (!item.product) {
                // Handle case where a product linked in the cart was deleted
                throw new Error(`Product with ID ${item.productId} not found.`);
            }
            const itemPrice = item.product.price * item.quantity;
            calculatedItemsPrice += itemPrice;
            return {
                name: item.product.name,
                qty: item.quantity,
                imageUrl: item.product.imageUrl, // Or use a default/specific image
                price: item.product.price, // Use current price from DB
                product: item.product._id,
            };
        });

        // TODO: Implement actual tax and shipping calculation logic if needed
        const taxPrice = 0; // Placeholder
        const shippingPrice = calculatedItemsPrice > 100 ? 0 : 10; // Placeholder logic
        const calculatedTotalPrice = calculatedItemsPrice + taxPrice + shippingPrice;
        const calculatedTotalCents = Math.round(calculatedTotalPrice * 100);

        // --- 5. Verify Payment Intent with Stripe --- 
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent) {
            throw new Error('Payment Intent not found.');
        }

        if (paymentIntent.status !== 'succeeded') {
             throw new Error(`Payment Intent status is not 'succeeded' (Status: ${paymentIntent.status}).`);
        }

        if (paymentIntent.amount !== calculatedTotalCents) {
            // Critical check to prevent manipulation
            console.warn(`Potential amount mismatch: Stripe PI ${paymentIntentId} amount=${paymentIntent.amount}, Calculated amount=${calculatedTotalCents}`);
            // TODO: Potentially issue a refund via Stripe API here if amounts mismatch significantly after payment
            // await stripe.refunds.create({ payment_intent: paymentIntentId });
            throw new Error('Payment amount verification failed. Please contact support.');
        }

        // --- 6. Create the Order within the transaction --- 
        const order = new Order({
            user: userId,
            orderItems,
            shippingAddress,
            paymentMethod: 'Stripe', // Or derive from paymentIntent if needed
            paymentResult: {
                id: paymentIntent.id,
                status: paymentIntent.status,
                update_time: new Date(paymentIntent.created * 1000).toISOString(), // Use created time
                // email_address: paymentIntent.receipt_email // If available
            },
            itemsPrice: calculatedItemsPrice,
            taxPrice: taxPrice,
            shippingPrice: shippingPrice,
            totalPrice: calculatedTotalPrice,
            isPaid: true,
            paidAt: Date.now(),
        });

        const createdOrder = await order.save({ session });

        // --- 7. Update Product Stock within the transaction --- 
        const stockUpdatePromises = orderItems.map(item => {
            return Product.findByIdAndUpdate(
                item.product, 
                { $inc: { countInStock: -item.qty } }, // Ensure field name matches Product model
                { new: true, session } // Return updated doc, run in session
            );
        });
        await Promise.all(stockUpdatePromises);
        // TODO: Add check here to ensure stock didn't go negative if validation wasn't strict enough

        // --- 8. Clear User's Cart within the transaction --- 
        cart.items = [];
        await cart.save({ session });

        // --- 9. Commit Transaction --- 
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ orderId: createdOrder._id }); // Return only orderId as per frontend expectation

    } catch (error) {
        // --- 10. Abort Transaction on Error --- 
        await session.abortTransaction();
        session.endSession();

        console.error('Create Order Error:', error);
        // Provide more specific error messages if possible
        if (error.message.includes('Payment Intent status')) {
             res.status(400).json({ message: error.message });
        } else if (error.message.includes('Payment amount verification failed')) {
             res.status(400).json({ message: error.message });
        } else if (error.message.includes('not found')) {
             res.status(404).json({ message: error.message });
        } else {
             res.status(500).json({ message: 'Server Error creating order', error: error.message });
        }
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Order owner or Admin)
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            'user',
            'name email' // Populate user details
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the logged-in user is the owner or an admin
        // Ensure req.user exists and has id/role properties
        if (!req.user || (order.user._id.toString() !== req.user.id && req.user.role !== 'admin')) {
             return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Get Order By ID Error:', error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Order not found (invalid ID format)' });
        }
        res.status(500).json({ message: 'Server Error fetching order' });
    }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private (Logged-in user)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }); // Sort newest first
        if (!req.user) {
             return res.status(401).json({ message: 'Not authorized' });
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get My Orders Error:', error);
        res.status(500).json({ message: 'Server Error fetching your orders' });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private (Admin or Farmer)
exports.updateOrderToDelivered = async (req, res) => {
    // Access control might need refinement (e.g., only farmer whose product is in the order?)
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Update Order to Delivered Error:', error);
        res.status(500).json({ message: 'Server Error updating order delivery status' });
    }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private (Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        // Populate user details for each order
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get All Orders Error:', error);
        res.status(500).json({ message: 'Server Error fetching all orders' });
    }
};

// @desc    Update order status by Farmer or Admin
// @route   PUT /api/orders/:id/status
// @access  Private (Admin or Farmer)
exports.updateOrderStatus = async (req, res) => {
    const { status: newStatus } = req.body;
    const orderId = req.params.id;

    // 1. Validate the incoming status
    const validStatuses = Order.schema.path('status').enumValues;
    if (!newStatus || !validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: `Invalid status provided. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Note: Authorization (Admin/Farmer) is handled by middleware in orderRoutes.js
        // TODO: Potential future enhancement: Check if the farmer is associated with any products in this order.

        order.status = newStatus;

        // Optional: Add consistency checks based on the new status
        // For example, if newStatus is 'Delivered', ensure isDelivered is also set.
        if (newStatus === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        } else if (newStatus !== 'Delivered' && order.isDelivered) {
            // If status changes *away* from Delivered, maybe reset isDelivered? Decide based on business logic.
            // order.isDelivered = false;
            // order.deliveredAt = null;
        }
         // Add similar logic for isPaid/paidAt if statuses like 'Cancelled' affect payment state.

        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);

    } catch (error) {
        console.error('Update Order Status Error:', error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Order not found (invalid ID format)' });
        }
        res.status(500).json({ message: 'Server Error updating order status' });
    }
};
