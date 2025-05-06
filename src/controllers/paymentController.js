const { Payment, Order } = require('../models');

module.exports = {
  // POST /payments (initiate payment for order)
  async create(req, res, next) {
    try {
      const { order_id } = req.body;
      const order = await Order.findByPk(order_id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      // Only allow payment for own order (unless admin)
      if (req.user.role !== 'admin' && order.user_id !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
      // Placeholder: mark as paid (simulate payment)
      const payment = await Payment.create({
        order_id,
        amount: order.total,
        status: 'paid',
        provider: 'manual',
        provider_payment_id: `test-${Date.now()}`
      });
      order.status = 'paid';
      order.payment_id = payment.id;
      await order.save();
      res.status(201).json({ payment });
    } catch (err) {
      next(err);
    }
  },

  // GET /payments/:id (get payment details)
  async get(req, res, next) {
    try {
      const payment = await Payment.findByPk(req.params.id);
      if (!payment) return res.status(404).json({ message: 'Payment not found' });
      const order = await Order.findByPk(payment.order_id);
      // Only allow viewing if admin, or owner of order
      if (req.user.role !== 'admin' && order.user_id !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
      res.json({ payment });
    } catch (err) {
      next(err);
    }
  }
};
