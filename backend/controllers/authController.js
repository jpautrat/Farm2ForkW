const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = await User.create({
            name,
            email,
            password, // Password will be hashed by mongoose pre-save hook
            role: role || 'customer' // Default to customer if role not provided or invalid
        });

        // Generate token and respond
        const token = generateToken(user._id, user.role);
        
        // Exclude password from user object sent in response
        const userResponse = { ...user._doc };
        delete userResponse.password;

        res.status(201).json({
            success: true,
            token,
            user: userResponse,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Registration Error:', error);
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server Error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        // Check for user by email, explicitly select password
        const user = await User.findOne({ email }).select('+password');

        // Check if user exists and password matches
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token and respond
        const token = generateToken(user._id, user.role);
        
        // Exclude password from user object sent in response
        const userResponse = { ...user._doc };
        delete userResponse.password;

        res.status(200).json({
            success: true,
            token,
            user: userResponse, 
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error during login' });
    }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private (Requires token)
exports.getMe = async (req, res, next) => {
    // req.user is attached by the protect middleware
    // We can optionally fetch fresh data if needed, but middleware already does
    try {
        // The user object attached by 'protect' middleware already excludes password
        const user = req.user;
        if (!user) {
             return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            success: true, 
            user 
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server Error fetching user profile' });
    }
};
