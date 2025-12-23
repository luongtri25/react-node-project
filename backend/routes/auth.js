// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Login with Google (idToken from frontend)
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'GOOGLE_CLIENT_ID not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const googleId = payload?.sub;
    if (!email) return res.status(400).json({ error: 'Email not found from Google' });

    const name = payload?.name || email.split('@')[0];
    const avatar = payload?.picture;

    let user = await User.findOne({ email });
    if (!user) {
      const randomPass = Math.random().toString(36).slice(-12);
      const hashed = await bcrypt.hash(randomPass, 10);
      user = await User.create({
        name,
        email,
        password: hashed,
        role: 'user',
        googleId,
        avatar,
        provider: 'google'
      });
    } else {
      // attach googleId/avatar if missing
      const update = {};
      if (!user.googleId && googleId) update.googleId = googleId;
      if (!user.avatar && avatar) update.avatar = avatar;
      if (!user.provider) update.provider = 'google';
      if (Object.keys(update).length) {
        Object.assign(user, update);
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { _id: user._id, email: user.email, role: user.role, name: user.name, avatar: user.avatar }
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(401).json({ error: 'Google token invalid' });
  }
});

module.exports = router;
