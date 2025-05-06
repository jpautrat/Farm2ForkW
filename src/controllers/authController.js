const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = {
  // POST /register
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ message: 'Email already in use.' });
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hash, role });
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
      res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Registration failed.', error: err.message });
    }
  },
  // POST /login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required.' });
      }
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
      res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Login failed.', error: err.message });
    }
  },
  // GET /me (protected)
  me: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'role'] });
      if (!user) return res.status(404).json({ message: 'User not found.' });
      res.json({ user });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch user.', error: err.message });
    }
  }
};
