// models/product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true }, // ví dụ: pikachu-figure
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String }], // đường dẫn hoặc URL
  category: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  attributes: { type: Map, of: String }, // tuỳ chọn: màu, kích cỡ, phiên bản...
}, { timestamps: true });

// text index để search
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
