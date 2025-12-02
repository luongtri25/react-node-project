// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, password bắt buộc' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email đã tồn tại' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    return res.status(201).json({
      message: 'User created',
      user: { email: user.email, _id: user._id, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email và password bắt buộc' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { _id: user._id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
