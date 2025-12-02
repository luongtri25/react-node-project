const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Cart = require('../models/cart');
const Product = require('../models/product');
const auth = require('../middleware/auth');

const router = express.Router();

// Lấy cart của user
router.get('/', auth, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate('items.product', 'name price images');
    return res.json(cart || { user: req.userId, items: [] });
  } catch (err) { next(err); }
});

// Thêm/cập nhật item
router.post(
  '/',
  auth,
  [
    body('productId').isMongoId(),
    body('quantity').optional().isInt({ min: 1 }).toInt(),
    body('attributes').optional().isObject()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { productId, quantity = 1, attributes = {} } = req.body;
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      let cart = await Cart.findOne({ user: req.userId });
      if (!cart) cart = await Cart.create({ user: req.userId, items: [] });

      const idx = cart.items.findIndex((i) => i.product.toString() === productId);
      if (idx >= 0) {
        cart.items[idx].quantity = quantity;
      } else {
        cart.items.push({
          product: productId,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images?.[0],
          attributes
        });
      }
      await cart.save();
      return res.json(cart);
    } catch (err) { next(err); }
  }
);

// Xóa item
router.delete('/:productId', auth, [param('productId').isMongoId()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    return res.json(cart);
  } catch (err) { next(err); }
});

module.exports = router;
