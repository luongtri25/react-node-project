const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  product: String,
  note: String,
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
