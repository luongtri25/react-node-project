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
    body('variantId').optional().isString(),
    body('quantity').optional().isInt({ min: 1 }).toInt(),
    body('attributes').optional().isObject()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { productId, quantity = 1, variantId, attributes = {} } = req.body;
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      // pick variant (required if exists)
      const variant =
        (product.variants || []).find((v) => v.variantId === variantId) ||
        (product.variants || [])[0];
      if (!variant) return res.status(400).json({ error: 'Variant not found' });

      const linePrice = typeof variant.price === 'number' ? variant.price : product.minPrice || 0;
      const lineName = variant.sizeCm ? `${product.name} - ${variant.sizeCm}cm` : product.name;
      const lineImage =
        (variant.images && variant.images[0]) ||
        product.thumbnail ||
        (product.images && product.images[0]) ||
        undefined;

      let cart = await Cart.findOne({ user: req.userId });
      if (!cart) cart = await Cart.create({ user: req.userId, items: [] });

      const idx = cart.items.findIndex(
        (i) =>
          i.product.toString() === productId &&
          (i.attributes?.get('variantId') || i.attributes?.variantId) === (variant.variantId || '')
      );
      if (idx >= 0) {
        cart.items[idx].quantity = quantity;
        cart.items[idx].price = linePrice;
        cart.items[idx].name = lineName;
        cart.items[idx].image = lineImage;
        cart.items[idx].attributes = {
          ...Object.fromEntries(cart.items[idx].attributes || []),
          ...attributes,
          variantId: variant.variantId || '',
          sizeCm: variant.sizeCm?.toString() || '',
          sku: variant.sku || '',
        };
      } else {
        cart.items.push({
          product: productId,
          name: lineName,
          price: linePrice,
          quantity,
          image: lineImage,
          attributes: {
            ...attributes,
            variantId: variant.variantId || '',
            sizeCm: variant.sizeCm?.toString() || '',
            sku: variant.sku || '',
          }
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
