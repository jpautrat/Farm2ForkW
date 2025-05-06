const request = require('supertest');
const app = require('../src/server');
const { User, Product, sequelize } = require('../src/models');
const bcrypt = require('bcrypt');

let consumerToken, consumerId, productId;

describe('Cart Endpoints & RBAC', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Create consumer
    const consumer = await User.create({
      name: 'Test Consumer',
      email: 'cartconsumer@example.com',
      password: await bcrypt.hash('testpass', 10),
      role: 'consumer',
    });
    consumerId = consumer.id;
    // Create product
    const product = await Product.create({
      name: 'Carrot',
      description: 'Fresh',
      price: 1.5,
      stock: 20,
      farmer_id: 1
    });
    productId = product.id;
    // Login and get token
    const consumerRes = await request(app).post('/auth/login').send({ email: 'cartconsumer@example.com', password: 'testpass' });
    consumerToken = consumerRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('Consumer can view (and auto-create) their cart', async () => {
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cart).toBeDefined();
    expect(res.body.cart.user_id).toBe(consumerId);
  });

  it('Consumer can add an item to the cart', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ product_id: productId, quantity: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body.item.product_id).toBe(productId);
    expect(res.body.item.quantity).toBe(3);
  });

  it('Consumer can update item quantity in the cart', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ product_id: productId, quantity: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.item.quantity).toBe(5);
  });

  it('Consumer can remove an item from the cart', async () => {
    const res = await request(app)
      .delete('/cart')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ product_id: productId });
    expect(res.statusCode).toBe(204);
  });

  it('Consumer can clear the cart', async () => {
    // Add two items
    await request(app).post('/cart').set('Authorization', `Bearer ${consumerToken}`).send({ product_id: productId, quantity: 2 });
    await request(app).post('/cart').set('Authorization', `Bearer ${consumerToken}`).send({ product_id: productId, quantity: 3 });
    // Clear
    const res = await request(app)
      .delete('/cart')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({});
    expect(res.statusCode).toBe(204);
  });

  it('Consumer cannot add invalid item', async () => {
    const res = await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ product_id: productId, quantity: 0 });
    expect(res.statusCode).toBe(400);
  });

  it('Non-consumer cannot access cart endpoints', async () => {
    // Create and login as farmer
    const farmer = await User.create({
      name: 'Farmer',
      email: 'farmercart@example.com',
      password: await bcrypt.hash('farmpass', 10),
      role: 'farmer',
    });
    const farmerRes = await request(app).post('/auth/login').send({ email: 'farmercart@example.com', password: 'farmpass' });
    const farmerToken = farmerRes.body.token;
    const res = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.statusCode).toBe(403);
  });
});
