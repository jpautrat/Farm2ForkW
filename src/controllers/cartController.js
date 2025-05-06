const { Cart, CartItem, Product } = require('../models');

module.exports = {
  // GET /cart
  async getCart(req, res, next) {
    try {
      let cart = await Cart.findOne({
        where: { user_id: req.user.id },
        include: [{ model: CartItem, as: 'cart_items', include: [{ model: Product, as: 'product' }] }]
      });
      if (!cart) {
        cart = await Cart.create({ user_id: req.user.id });
      }
      res.json({ cart });
    } catch (err) {
      next(err);
    }
  },

  // POST /cart (add/update items)
  async updateCart(req, res, next) {
    try {
      const { product_id, quantity } = req.body;
      if (!product_id || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Invalid product or quantity' });
      }
      let cart = await Cart.findOne({ where: { user_id: req.user.id } });
      if (!cart) cart = await Cart.create({ user_id: req.user.id });
      let item = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });
      if (item) {
        item.quantity = quantity;
        await item.save();
      } else {
        item = await CartItem.create({ cart_id: cart.id, product_id, quantity });
      }
      res.json({ item });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /cart (remove item or clear cart)
  async deleteCart(req, res, next) {
    try {
      const { product_id } = req.body;
      let cart = await Cart.findOne({ where: { user_id: req.user.id } });
      if (!cart) return res.status(404).json({ message: 'Cart not found' });
      if (product_id) {
        // Remove single item
        await CartItem.destroy({ where: { cart_id: cart.id, product_id } });
      } else {
        // Clear cart
        await CartItem.destroy({ where: { cart_id: cart.id } });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};
