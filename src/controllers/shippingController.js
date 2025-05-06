const { Shipping, Order, OrderItem, Product } = require('../models');

module.exports = {
  // POST /shipping (create shipping for order)
  async create(req, res, next) {
    try {
      const { order_id, address, method } = req.body;
      const order = await Order.findByPk(order_id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      // Only allow shipping for own order (unless admin)
      if (req.user.role !== 'admin' && order.user_id !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
      // Simulate shipping creation
      const shipping = await Shipping.create({
        order_id,
        address,
        method,
        status: 'pending',
        tracking_number: `TRACK-${Date.now()}`,
        provider: 'manual',
        rate: 5.0
      });
      order.shipping_id = shipping.id;
      await order.save();
      res.status(201).json({ shipping });
    } catch (err) {
      next(err);
    }
  },

  // GET /shipping/:id (get shipping details)
  async get(req, res, next) {
    try {
      const shipping = await Shipping.findByPk(req.params.id);
      if (!shipping) return res.status(404).json({ message: 'Shipping not found' });
      const order = await Order.findByPk(shipping.order_id);
      if (req.user.role === 'admin' || (order.user_id === req.user.id)) {
        return res.json({ shipping });
      }
      // Farmer: can view if their product is in the order
      if (req.user.role === 'farmer') {
        const items = await OrderItem.findAll({ where: { order_id: order.id }, include: [{ model: Product, as: 'product' }] });
        if (items.some(item => item.product.farmer_id === req.user.id)) {
          return res.json({ shipping });
        }
      }
      return res.status(403).json({ message: 'Forbidden' });
    } catch (err) {
      next(err);
    }
  }
};
