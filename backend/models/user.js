// backend/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  googleId: { type: String, index: true, sparse: true },
  avatar: { type: String },
  provider: { type: String, default: 'local' }
}, { timestamps: true });

// Nếu model đã tồn tại trong mongoose.models thì reuse, nếu chưa thì tạo mới
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
