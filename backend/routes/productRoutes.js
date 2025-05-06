const express = require('express');
const {
    getAllProducts,
    getProductById,
    getMyProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.route('/')
    .get(getAllProducts)
    // Farmers create products via POST to the base route
    .post(protect, authorize('farmer'), createProduct); 

router.route('/my-products')
    // Farmers get their own products
    .get(protect, authorize('farmer'), getMyProducts);

router.route('/:id')
    .get(getProductById)
    // Farmers update their own products (ownership checked in controller)
    .put(protect, authorize('farmer'), updateProduct)
    // Farmers delete their own products (ownership checked in controller)
    .delete(protect, authorize('farmer'), deleteProduct); 

module.exports = router;
