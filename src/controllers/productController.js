const { Product } = require('../models');

module.exports = {
  // GET /products
  async list(req, res, next) {
    try {
      const products = await Product.findAll();
      res.json({ products });
    } catch (err) {
      next(err);
    }
  },
  // GET /products/:id
  async get(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json({ product });
    } catch (err) {
      next(err);
    }
  },
  // POST /products
  async create(req, res, next) {
    try {
      const { name, description, price, stock } = req.body;
      if (!name || !price || !stock) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const product = await Product.create({
        name,
        description,
        price,
        stock,
        farmer_id: req.user.id
      });
      res.status(201).json({ product });
    } catch (err) {
      next(err);
    }
  },
  // PUT /products/:id
  async update(req, res, next) {
    try {
      const { name, description, price, stock } = req.body;
      await req.product.update({ name, description, price, stock });
      res.json({ product: req.product });
    } catch (err) {
      next(err);
    }
  },
  // DELETE /products/:id
  async remove(req, res, next) {
    try {
      await req.product.destroy();
      res.json({ message: 'Product deleted' });
    } catch (err) {
      next(err);
    }
  }
};
