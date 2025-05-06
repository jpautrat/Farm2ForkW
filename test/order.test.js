const request = require('supertest');
const app = require('../src/server');
const { User, Product, Order, OrderItem, sequelize } = require('../src/models');
const bcrypt = require('bcrypt');

let farmerToken, adminToken, consumerToken, farmerId, adminId, consumerId, productId;

describe('Order/Cart Endpoints & RBAC', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Create users
    const farmer = await User.create({
      name: 'Farmer Joe',
      email: 'farmer@example.com',
      password: await bcrypt.hash('testpass', 10),
      role: 'farmer',
    });
    farmerId = farmer.id;
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('adminpass', 10),
      role: 'admin',
    });
    adminId = admin.id;
    const consumer = await User.create({
      name: 'Consumer',
      email: 'consumer@example.com',
      password: await bcrypt.hash('consumerpass', 10),
      role: 'consumer',
    });
    consumerId = consumer.id;
    // Create product
    const product = await Product.create({
      name: 'Tomato',
      description: 'Fresh',
      price: 2.5,
      stock: 10,
      farmer_id: farmerId
    });
    productId = product.id;
    // Login and get tokens
    const farmerRes = await request(app).post('/auth/login').send({ email: 'farmer@example.com', password: 'testpass' });
    farmerToken = farmerRes.body.token;
    const adminRes = await request(app).post('/auth/login').send({ email: 'admin@example.com', password: 'adminpass' });
    adminToken = adminRes.body.token;
    const consumerRes = await request(app).post('/auth/login').send({ email: 'consumer@example.com', password: 'consumerpass' });
    consumerToken = consumerRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('Consumer can create an order from cart', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ cart: [{ product_id: productId, quantity: 2 }] });
    expect(res.statusCode).toBe(201);
    expect(res.body.order_id).toBeDefined();
  });

  it('Stock is decremented after order', async () => {
    const product = await Product.findByPk(productId);
    expect(product.stock).toBe(8);
  });

  it('Cannot order more than in stock', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ cart: [{ product_id: productId, quantity: 100 }] });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/insufficient/i);
  });

  it('Consumer can see only their orders', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBeGreaterThan(0);
    for (const order of res.body.orders) {
      expect(order.user_id).toBe(consumerId);
    }
  });

  it('Farmer can see orders for their products', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    // Should contain at least one order
    expect(res.body.orders.length).toBeGreaterThan(0);
    // Each order should contain at least one item with this farmer's product
    let found = false;
    for (const order of res.body.orders) {
      for (const item of order.order_items) {
        if (item.product_id === productId) found = true;
      }
    }
    expect(found).toBe(true);
  });

  it('Admin can see all orders', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });

  it('Consumer cannot order without authentication', async () => {
    const res = await request(app)
      .post('/orders')
      .send({ cart: [{ product_id: productId, quantity: 1 }] });
    expect(res.statusCode).toBe(401);
  });
});
