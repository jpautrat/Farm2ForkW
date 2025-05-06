const { Order, OrderItem, Product, User } = require('../models');

module.exports = {
  // GET /orders (list current user's orders or all for admin)
  async list(req, res, next) {
    try {
      let where = {};
      if (req.user.role === 'consumer') {
        where.user_id = req.user.id;
      } else if (req.user.role === 'farmer') {
        // Farmer: show orders containing their products
        const items = await OrderItem.findAll({ include: [{ model: Product, as: 'product', where: { farmer_id: req.user.id } }] });
        const orderIds = items.map(i => i.order_id);
        where.id = orderIds.length ? orderIds : 0;
      }
      const orders = await Order.findAll({
        where,
        include: [{
          model: OrderItem,
          as: 'order_items',
          include: [{ model: Product, as: 'product' }]
        }]
      });
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  },
  // GET /orders/:id (details, RBAC in middleware)
  async get(req, res, next) {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [{
          model: OrderItem,
          as: 'order_items',
          include: [{ model: Product, as: 'product' }]
        }]
      });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json({ order });
    } catch (err) {
      next(err);
    }
  },
  // POST /orders (create order from cart)
  async create(req, res, next) {
    try {
      // Expect cart: [{ product_id, quantity }]
      const { cart } = req.body;
      if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      // Validate products and stock
      const productIds = cart.map(i => i.product_id);
      const products = await Product.findAll({ where: { id: productIds } });
      if (products.length !== cart.length) {
        return res.status(400).json({ message: 'Some products not found' });
      }
      // Check stock
      for (const item of cart) {
        const product = products.find(p => p.id === item.product_id);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for product ${item.product_id}` });
        }
      }
      // Calculate total
      let total = 0;
      for (const item of cart) {
        const price = parseFloat(products.find(p => p.id === item.product_id).price);
        total += price * item.quantity;
      }
      // Create order with total
      const order = await Order.create({ user_id: req.user.id, status: 'pending', total });
      for (const item of cart) {
        await OrderItem.create({ order_id: order.id, product_id: item.product_id, quantity: item.quantity, price: products.find(p => p.id === item.product_id).price });
        // Decrement stock
        await Product.update({ stock: products.find(p => p.id === item.product_id).stock - item.quantity }, { where: { id: item.product_id } });
      }
      res.status(201).json({ order_id: order.id });
    } catch (err) {
      next(err);
    }
  }
};
