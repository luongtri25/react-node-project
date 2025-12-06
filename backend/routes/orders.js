// backend/routes/orders.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const router = express.Router();
const ORDER_STATUSES = ['created', 'processing', 'completed', 'cancelled', 'refunded'];

const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items required'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('productId invalid'),
  body('items.*.variantId').optional().isString(),
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

    // Normalize shipping address fields
    const shippingAddress = {
      fullName: shipping.address?.fullName || shipping.fullName || '',
      phone: shipping.address?.phone || shipping.phone || '',
      line1:
        shipping.address?.line1 ||
        shipping.addressLine ||
        shipping.line1 ||
        shipping.address ||
        '',
      city: shipping.address?.city || shipping.city || '',
      province: shipping.address?.province || shipping.province || '',
      postalCode: shipping.address?.postalCode || shipping.postalCode || '',
      country: shipping.address?.country || shipping.country || '',
    };

    const shippingPayload = {
      ...shipping,
      address: shippingAddress,
      status: shipping.status || 'pending',
    };

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
      const variant =
        (product.variants || []).find((v) => v.variantId === i.variantId) ||
        (product.variants || [])[0];
      if (!variant) return res.status(400).json({ error: `Variant not found for product ${i.productId}` });

      const price = typeof variant.price === 'number' ? variant.price : product.minPrice || 0;
      const lineTotal = price * quantity;
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        name: variant.sizeCm ? `${product.name} - ${variant.sizeCm}cm` : product.name,
        price,
        quantity,
        image:
          (variant.images && variant.images[0]) ||
          product.thumbnail ||
          (product.images && product.images[0]),
        attributes: {
          ...(i.attributes || {}),
          variantId: variant.variantId || '',
          sizeCm: variant.sizeCm?.toString() || '',
          sku: variant.sku || '',
        },
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
      shipping: shippingPayload,
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

// PATCH /orders/:id/status (admin) - update order status
router.patch(
  '/:id/status',
  auth,
  adminOnly,
  [param('id').isMongoId(), body('status').isIn(ORDER_STATUSES)],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json(order);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
