const Product = require('../models/Product');
const User = require('../models/User'); // Needed potentially for checking farmer role

// @desc    Get all products (public access)
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        // Basic fetching, can add pagination, filtering, sorting later
        const products = await Product.find({}).populate('farmer', 'name email'); // Populate farmer details
        res.status(200).json(products);
    } catch (error) {
        console.error('Get All Products Error:', error);
        res.status(500).json({ message: 'Server Error fetching products' });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('farmer', 'name email');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Get Product By ID Error:', error);
        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Product not found (invalid ID format)' });
        }
        res.status(500).json({ message: 'Server Error fetching product' });
    }
};

// @desc    Get products listed by the logged-in farmer
// @route   GET /api/products/my-products
// @access  Private (Farmer only)
exports.getMyProducts = async (req, res) => {
    try {
        // req.user is attached by 'protect' middleware
        const products = await Product.find({ farmer: req.user.id });
        res.status(200).json(products);
    } catch (error) {
        console.error('Get My Products Error:', error);
        res.status(500).json({ message: 'Server Error fetching your products' });
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Farmer only)
exports.createProduct = async (req, res) => {
    const { name, description, price, category, stock, imageUrl } = req.body;

    try {
        // req.user is attached by 'protect' middleware
        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            imageUrl, // Optional
            farmer: req.user.id, // Associate product with the logged-in farmer
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Create Product Error:', error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server Error creating product' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Farmer owner only)
exports.updateProduct = async (req, res) => {
    const { name, description, price, category, stock, imageUrl } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the logged-in user is the farmer who owns the product
        if (product.farmer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to update this product' });
        }

        // Update fields
        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.stock = stock ?? product.stock;
        product.imageUrl = imageUrl ?? product.imageUrl;
        // updatedAt is handled by middleware

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Update Product Error:', error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Product not found (invalid ID format)' });
        }
        res.status(500).json({ message: 'Server Error updating product' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Farmer owner only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the logged-in user is the farmer who owns the product
        if (product.farmer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this product' });
        }

        await product.deleteOne(); // Use deleteOne on the document instance

        res.status(200).json({ message: 'Product removed successfully' });
    } catch (error) {
        console.error('Delete Product Error:', error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Product not found (invalid ID format)' });
        }
        res.status(500).json({ message: 'Server Error deleting product' });
    }
};
