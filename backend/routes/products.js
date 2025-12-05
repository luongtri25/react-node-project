// routes/products.js
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');      // middleware JWT verify (bạn có trước đó)
const adminOnly = require('../middleware/admin'); // middleware check admin

const router = express.Router();

// GET /products?search=&category=&page=&limit=&sort=price_asc
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isString(),
    query('category').optional().isString(),
    query('search').optional().isString()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return productController.list(req, res, next);
  }
);

// GET /products/:id
router.get(
  '/:id',
  [ param('id').isMongoId() ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return productController.getById(req, res, next);
  }
);

// POST /products  (admin)
router.post(
  '/',
  auth,           // cần phải đăng nhập
  adminOnly,      // chỉ admin
  [
    body('name').isString().notEmpty(),
    body('category').isString().notEmpty(),
    body('pokemon').optional().isString(),
    body('description').optional().isString(),
    body('thumbnail').optional().isString(),
    body('images').optional().isArray(),
    body('tags').optional().isArray(),
    body('variants').isArray({ min: 1 }).withMessage('variants required'),
    body('variants.*.variantId').isString().notEmpty(),
    body('variants.*.price').isNumeric().custom((v) => v >= 0),
    body('variants.*.sizeCm').optional().isNumeric(),
    body('variants.*.stock').optional().isInt({ min: 0 }).toInt(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return productController.create(req, res, next);
  }
);

// PUT /products/:id  (admin)
router.put(
  '/:id',
  auth,
  adminOnly,
  [
    param('id').isMongoId(),
    body('name').optional().isString().notEmpty(),
    body('category').optional().isString(),
    body('pokemon').optional().isString(),
    body('description').optional().isString(),
    body('thumbnail').optional().isString(),
    body('images').optional().isArray(),
    body('tags').optional().isArray(),
    body('variants').optional().isArray(),
    body('variants.*.variantId').optional().isString(),
    body('variants.*.price').optional().isNumeric().custom((v) => v >= 0),
    body('variants.*.sizeCm').optional().isNumeric(),
    body('variants.*.stock').optional().isInt({ min: 0 }).toInt(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return productController.update(req, res, next);
  }
);

// DELETE /products/:id (admin)
router.delete(
  '/:id',
  auth,
  adminOnly,
  [ param('id').isMongoId() ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return productController.remove(req, res, next);
  }
);

module.exports = router;
