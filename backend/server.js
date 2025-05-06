require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // We will create this file next

// Connect to Database
connectDB();

const app = express();

// Init Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ extended: false })); // Enable JSON body parsing

// Simple Root Route
app.get('/', (req, res) => res.send('Farm2Fork API Running'));

// Define Routes (We will add these later)
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // Import payment routes
const farmerRoutes = require('./routes/farmerRoutes'); // Import farmer routes

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes); // Use payment routes
app.use('/api/farmer', farmerRoutes); // Mount farmer routes

// Global Error Handler (Example)
app.use((err, req, res, next) => {
  // Implement error handling logic here
});

const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
