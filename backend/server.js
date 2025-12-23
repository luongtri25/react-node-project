// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const requestRoutes = require('./routes/requests');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/requests', requestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Serve frontend build (optional, for deployment)
const frontendPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendPath));
app.use((req, res, next) => {
  // fallback for SPA routes (exclude API)
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(frontendPath, 'index.html'));
  }
  next();
});

// API test echo
app.post('/api/echo', (req, res) => {
  const { text } = req.body || {};
  console.log('Echo text:', text);
  res.json({
    ok: true,
    echo: text || ''
  });
});

// Test route
app.get('/api/ping', (req, res) => res.json({ message: 'Pong from backend!' }));

// Connect MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/datapokemon';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connect error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
