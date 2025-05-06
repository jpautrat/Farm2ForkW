const request = require('supertest');
const app = require('../src/server');
const { User, Product, Order, sequelize } = require('../src/models');
const bcrypt = require('bcrypt');

let consumerToken, adminToken, consumerId, adminId, orderId, paymentId;

describe('Payment Endpoints & RBAC', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Create consumer and admin
    const consumer = await User.create({
      name: 'Pay Consumer',
      email: 'payconsumer@example.com',
      password: await bcrypt.hash('testpass', 10),
      role: 'consumer',
    });
    consumerId = consumer.id;
    const admin = await User.create({
      name: 'Pay Admin',
      email: 'payadmin@example.com',
      password: await bcrypt.hash('adminpass', 10),
      role: 'admin',
    });
    adminId = admin.id;
    // Create product and order
    const product = await Product.create({
      name: 'Eggplant',
      description: 'Fresh',
      price: 3.0,
      stock: 5,
      farmer_id: 1
    });
    const order = await Order.create({
      user_id: consumerId,
      status: 'pending',
      total: 6.0
    });
    orderId = order.id;
    // Login and get tokens
    const consumerRes = await request(app).post('/auth/login').send({ email: 'payconsumer@example.com', password: 'testpass' });
    consumerToken = consumerRes.body.token;
    const adminRes = await request(app).post('/auth/login').send({ email: 'payadmin@example.com', password: 'adminpass' });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('Consumer can pay for their own order', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ order_id: orderId });
    expect(res.statusCode).toBe(201);
    expect(res.body.payment).toBeDefined();
    expect(res.body.payment.order_id).toBe(orderId);
    paymentId = res.body.payment.id;
  });

  it('Consumer can view their payment', async () => {
    const res = await request(app)
      .get(`/payments/${paymentId}`)
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.payment.id).toBe(paymentId);
  });

  it('Admin can view any payment', async () => {
    const res = await request(app)
      .get(`/payments/${paymentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.payment.id).toBe(paymentId);
  });

  it('Consumer cannot pay for someone else\'s order', async () => {
    // Create another consumer and order
    const other = await User.create({
      name: 'Other',
      email: 'otherpay@example.com',
      password: await bcrypt.hash('otherpass', 10),
      role: 'consumer',
    });
    const otherOrder = await Order.create({
      user_id: other.id,
      status: 'pending',
      total: 5.0
    });
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ order_id: otherOrder.id });
    expect(res.statusCode).toBe(403);
  });
});
