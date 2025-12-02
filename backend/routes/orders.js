// backend/routes/orders.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const router = express.Router();

const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items required'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('productId invalid'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('quantity invalid'),
  body('shipping').optional().isObject(),
  body('payment').optional().isObject(),
];

router.post('/', auth, validateOrder, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { items, shipping = {}, payment = {}, note = '', shippingFee = 0 } = req.body;

    // Fetch product info to compute price on server
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const map = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    let subtotal = 0;

    for (const i of items) {
      const product = map.get(i.productId);
      if (!product) return res.status(400).json({ error: `Product not found: ${i.productId}` });
      const quantity = i.quantity || 1;
      const lineTotal = product.price * quantity;
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images?.[0],
        attributes: i.attributes || {},
      });
    }

    const total = subtotal + (shippingFee || 0);

    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      subtotal,
      shippingFee: shippingFee || 0,
      total,
      payment,
      shipping,
      note,
      status: 'created',
    });

    // optional: clear cart after order
    await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });

    return res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/all', auth, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
    return res.json(orders);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
