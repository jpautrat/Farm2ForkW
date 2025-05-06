const request = require('supertest');
const app = require('../src/server');
const { User, Product, sequelize } = require('../src/models');
const bcrypt = require('bcrypt');

let farmerToken, adminToken, consumerToken, farmerId, adminId, consumerId, productId;

describe('Product Endpoints & RBAC', () => {
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

  it('Farmer can create a product', async () => {
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ name: 'Tomato', description: 'Fresh', price: 2.5, stock: 100 });
    expect(res.statusCode).toBe(201);
    expect(res.body.product.name).toBe('Tomato');
    productId = res.body.product.id;
  });

  it('Consumer cannot create a product', async () => {
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ name: 'Potato', description: 'Yummy', price: 1.5, stock: 50 });
    expect(res.statusCode).toBe(403);
  });

  it('Anyone can list products', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('Anyone can get a product by id', async () => {
    const res = await request(app).get(`/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.product.id).toBe(productId);
  });

  it('Farmer can update their own product', async () => {
    const res = await request(app)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ name: 'Tomato', description: 'Very Fresh', price: 2.5, stock: 100 });
    expect(res.statusCode).toBe(200);
    expect(res.body.product.description).toBe('Very Fresh');
  });

  it('Another farmer cannot update this product', async () => {
    // Create another farmer
    const otherFarmer = await User.create({
      name: 'Farmer Sue',
      email: 'sue@example.com',
      password: await bcrypt.hash('suepass', 10),
      role: 'farmer',
    });
    const sueRes = await request(app).post('/auth/login').send({ email: 'sue@example.com', password: 'suepass' });
    const sueToken = sueRes.body.token;
    const res = await request(app)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${sueToken}`)
      .send({ name: 'Tomato', description: 'Sue Edit', price: 2.5, stock: 100 });
    expect(res.statusCode).toBe(403);
  });

  it('Admin can update any product', async () => {
    const res = await request(app)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Tomato', description: 'Admin Edit', price: 2.5, stock: 100 });
    expect(res.statusCode).toBe(200);
    expect(res.body.product.description).toBe('Admin Edit');
  });

  it('Consumer cannot update any product', async () => {
    const res = await request(app)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ name: 'Tomato', description: 'Consumer Edit', price: 2.5, stock: 100 });
    expect(res.statusCode).toBe(403);
  });

  it('Farmer can delete their own product', async () => {
    // Create a new product to delete
    const resCreate = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ name: 'Cucumber', description: 'Green', price: 1, stock: 20 });
    const cucumberId = resCreate.body.product.id;
    const res = await request(app)
      .delete(`/products/${cucumberId}`)
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('Admin can delete any product', async () => {
    const res = await request(app)
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('Consumer cannot delete any product', async () => {
    // Create a new product as farmer
    const resCreate = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ name: 'Lettuce', description: 'Leafy', price: 1.1, stock: 25 });
    const lettuceId = resCreate.body.product.id;
    const res = await request(app)
      .delete(`/products/${lettuceId}`)
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.statusCode).toBe(403);
  });
});
