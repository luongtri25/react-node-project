// controllers/productController.js
const Product = require('../models/product');
const mongoose = require('mongoose');
const slugify = require('slugify'); // optional, npm i slugify

// GET /products
exports.list = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.$text = { $search: req.query.search };
    if (req.query.priceMin || req.query.priceMax) {
      filter.price = {};
      if (req.query.priceMin) filter.price.$gte = Number(req.query.priceMin);
      if (req.query.priceMax) filter.price.$lte = Number(req.query.priceMax);
    }

    // sorting
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      if (req.query.sort === 'price_asc') sort = { price: 1 };
      if (req.query.sort === 'price_desc') sort = { price: -1 };
      if (req.query.sort === 'rating_desc') sort = { rating: -1 };
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      data: items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /products/:id
exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /products
exports.create = async (req, res, next) => {
  try {
    const { name, price, images = [], category, description = '', stock = 0 } = req.body;

    // create slug from name and ensure uniqueness fallback
    let slug = slugify(name, { lower: true, strict: true });
    // if slug exists, append random string
    const exists = await Product.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const product = new Product({
      name,
      slug,
      price,
      images,
      category,
      description,
      stock
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /products/:id
exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const payload = { ...req.body };

    // if name changed, optionally update slug
    if (payload.name) {
      payload.slug = slugify(payload.name, { lower: true, strict: true });
      // avoid slug collision
      const other = await Product.findOne({ slug: payload.slug, _id: { $ne: id } });
      if (other) payload.slug = `${payload.slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /products/:id
exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    // if invalid id format, Mongoose throws CastError -> handled by error middleware
    next(err);
  }
};
