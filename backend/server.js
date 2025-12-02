// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const requestRoutes = require('./routes/requests');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();

// Middlewares cần thiết
app.use(cors());
app.use(express.json()); // parse JSON body trước khi vào routes

// Routes
app.use('/api/requests', requestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

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
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connect error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy port ${PORT}`));
