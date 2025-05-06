const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true, // Remove whitespace
    },
    description: {
        type: String,
        required: [true, 'Please provide a product description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a product price'],
        min: [0, 'Price cannot be negative'],
    },
    category: {
        type: String,
        trim: true, // Normalize category names
        // Consider using enum if you have predefined categories
        // enum: ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Other'],
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
    },
    imageUrl: {
        type: String, // URL to the product image
        // Add validation or default image URL if needed
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
        // Ensure this user has the 'farmer' role (can be validated in controller)
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update `updatedAt` field on update
ProductSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updatedAt = Date.now();
    }
    next();
});

// Indexes can improve query performance
ProductSchema.index({ name: 'text', description: 'text', category: 'text' }); // For text search
ProductSchema.index({ farmer: 1 }); // For querying farmer's products
ProductSchema.index({ category: 1 }); // For filtering by category

module.exports = mongoose.model('Product', ProductSchema);
