const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const { User, sequelize } = require('../src/models');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await User.create({
      name: 'Farmer Joe',
      email: 'farmer@example.com',
      password: await require('bcrypt').hash('testpass', 10),
      role: 'farmer',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Jane', email: 'jane@example.com', password: 'secret', role: 'consumer' });
      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('jane@example.com');
    });
    it('should not register with duplicate email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Jane', email: 'farmer@example.com', password: 'secret', role: 'consumer' });
      expect(res.statusCode).toBe(409);
    });
    it('should require all fields', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'missing@example.com', password: 'secret' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'farmer@example.com', password: 'testpass' });
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('farmer@example.com');
    });
    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'farmer@example.com', password: 'wrongpass' });
      expect(res.statusCode).toBe(401);
    });
    it('should require email and password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'farmer@example.com' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    let token;
    beforeAll(async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'farmer@example.com', password: 'testpass' });
      token = res.body.token;
    });
    it('should return user info with valid JWT', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('farmer@example.com');
    });
    it('should fail without JWT', async () => {
      const res = await request(app)
        .get('/auth/me');
      expect(res.statusCode).toBe(401);
    });
    it('should fail with invalid JWT', async () => {
      const fakeToken = jwt.sign({ id: 999 }, 'wrong_secret');
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${fakeToken}`);
      expect(res.statusCode).toBe(403);
    });
  });
});
