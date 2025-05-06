// backend/controllers/farmerController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/asyncHandler'); // Assuming you have this for error handling

// @desc    Get products listed by the logged-in farmer
// @route   GET /api/farmer/products
// @access  Private (Farmer only)
exports.getMyProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find({ user: req.user.id }); // Find products by logged-in user ID
    res.status(200).json(products);
});

// @desc    Get orders containing products sold by the logged-in farmer
// @route   GET /api/farmer/orders
// @access  Private (Farmer only)
exports.getMySalesOrders = asyncHandler(async (req, res, next) => {
    // Find orders, populate product details within items, then filter
    // This approach fetches all orders first, which might be inefficient for large datasets.
    // A more optimized approach might involve querying products first or using aggregation.
    
    // Fetch all orders with product details populated
    const allOrders = await Order.find({ isPaid: true }) // Consider only paid orders? 
                             .populate({ 
                                 path: 'orderItems.product', 
                                 model: 'Product', 
                                 select: 'name price user' // Select fields needed, including the product's user ID
                              })
                             .populate('user', 'name email') // Populate the buyer's info
                             .sort({ createdAt: -1 });

    // Filter orders to include only those containing the farmer's products
    const farmerSalesOrders = allOrders.filter(order => 
        order.orderItems.some(item => 
            item.product && item.product.user && item.product.user.toString() === req.user.id
        )
    );
    
    // Optional: Modify the result to only show relevant items/info to the farmer
    // For now, returning the filtered orders as is.

    res.status(200).json(farmerSalesOrders);
});
