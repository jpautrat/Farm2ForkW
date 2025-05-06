const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Reference to the customer
        },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                imageUrl: { type: String }, // Image URL at the time of order
                price: { type: Number, required: true }, // Price at the time of order
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
            },
        ],
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true, // e.g., 'Stripe', 'PayPal'
        },
        paymentResult: {
            // Structure depends on payment provider (e.g., Stripe charge object)
            id: { type: String }, 
            status: { type: String },
            update_time: { type: String }, // Timestamp from provider
            email_address: { type: String }, // Payer email from provider
        },
        itemsPrice: {
            // Price of items before tax and shipping
            type: Number,
            required: true,
            default: 0.0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Processing',
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

module.exports = mongoose.model('Order', OrderSchema);
