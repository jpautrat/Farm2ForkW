require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const shippingRoutes = require('./routes/shipping');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/shipping', shippingRoutes);
app.use('/admin', adminRoutes);
app.use('/cart', cartRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
  console.log('Database synchronized');
  if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
});

module.exports = app;
