const request = require('supertest');
const app = require('../src/server');
const { User, Product, Order, OrderItem, sequelize } = require('../src/models');
const bcrypt = require('bcrypt');

let consumerToken, adminToken, farmerToken, consumerId, adminId, farmerId, orderId, shippingId;

describe('Shipping Endpoints & RBAC', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Create users
    const consumer = await User.create({
      name: 'Ship Consumer',
      email: 'shipconsumer@example.com',
      password: await bcrypt.hash('testpass', 10),
      role: 'consumer',
    });
    consumerId = consumer.id;
    const admin = await User.create({
      name: 'Ship Admin',
      email: 'shipadmin@example.com',
      password: await bcrypt.hash('adminpass', 10),
      role: 'admin',
    });
    adminId = admin.id;
    const farmer = await User.create({
      name: 'Ship Farmer',
      email: 'shipfarmer@example.com',
      password: await bcrypt.hash('farmpass', 10),
      role: 'farmer',
    });
    farmerId = farmer.id;
    // Create product and order
    const product = await Product.create({
      name: 'Lettuce',
      description: 'Fresh',
      price: 2.0,
      stock: 8,
      farmer_id: farmerId
    });
    const order = await Order.create({
      user_id: consumerId,
      status: 'paid',
      total: 4.0
    });
    orderId = order.id;
    await OrderItem.create({ order_id: orderId, product_id: product.id, quantity: 2, price: 2.0 });
    // Login and get tokens
    const consumerRes = await request(app).post('/auth/login').send({ email: 'shipconsumer@example.com', password: 'testpass' });
    consumerToken = consumerRes.body.token;
    const adminRes = await request(app).post('/auth/login').send({ email: 'shipadmin@example.com', password: 'adminpass' });
    adminToken = adminRes.body.token;
    const farmerRes = await request(app).post('/auth/login').send({ email: 'shipfarmer@example.com', password: 'farmpass' });
    farmerToken = farmerRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('Consumer can create shipping for their own order', async () => {
    const res = await request(app)
      .post('/shipping')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ order_id: orderId, address: '123 Main St', method: 'delivery' });
    expect(res.statusCode).toBe(201);
    expect(res.body.shipping).toBeDefined();
    shippingId = res.body.shipping.id;
  });

  it('Consumer can view their shipping', async () => {
    const res = await request(app)
      .get(`/shipping/${shippingId}`)
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.shipping.id).toBe(shippingId);
  });

  it('Admin can view any shipping', async () => {
    const res = await request(app)
      .get(`/shipping/${shippingId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.shipping.id).toBe(shippingId);
  });

  it('Farmer can view shipping for orders with their product', async () => {
    const res = await request(app)
      .get(`/shipping/${shippingId}`)
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.shipping.id).toBe(shippingId);
  });

  it('Consumer cannot create shipping for someone else\'s order', async () => {
    // Create another consumer and order
    const other = await User.create({
      name: 'Other',
      email: 'othership@example.com',
      password: await bcrypt.hash('otherpass', 10),
      role: 'consumer',
    });
    const otherOrder = await Order.create({
      user_id: other.id,
      status: 'paid',
      total: 5.0
    });
    const res = await request(app)
      .post('/shipping')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ order_id: otherOrder.id, address: '456 Elm St', method: 'pickup' });
    expect(res.statusCode).toBe(403);
  });
});
