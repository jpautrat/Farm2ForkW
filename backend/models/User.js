const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Do not return password by default when querying users
    },
    role: {
        type: String,
        enum: ['customer', 'farmer', 'admin'],
        default: 'customer'
    },
    // Optional fields - can add more later
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    phoneNumber: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to hash password before saving a new user
UserSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified (or is new)
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
