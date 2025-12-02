// models/order.js
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  image: String,
  attributes: { type: Map, of: String }
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  method: { type: String }, // e.g., "card", "cod"
  status: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  paidAt: Date,
  transactionId: String
}, { _id: false });

const ShippingSchema = new mongoose.Schema({
  address: {
    fullName: String,
    phone: String,
    line1: String,
    city: String,
    province: String,
    postalCode: String,
    country: String
  },
  shippedAt: Date,
  status: { type: String, enum: ['pending','shipped','delivered','cancelled'], default: 'pending' },
  courier: String,
  trackingNumber: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payment: PaymentSchema,
  shipping: ShippingSchema,
  status: { type: String, enum: ['created','processing','completed','cancelled','refunded'], default: 'created' },
  note: String
}, { timestamps: true });

// index để tìm theo user và thời gian
OrderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
