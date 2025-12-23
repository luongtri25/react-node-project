// models/cart.js
const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String, // snapshot name/price to prevent later change issues
  price: Number,
  quantity: { type: Number, default: 1, min: 1 },
  image: String,
  attributes: { type: Map, of: String } // ví dụ: color, size
}, { _id: false });

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
