const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/user');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const router = express.Router();

// GET /api/users (admin) - list users
router.get('/', auth, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json(users);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/role (admin) - update role
router.put(
  '/:id/role',
  auth,
  adminOnly,
  [param('id').isMongoId(), body('role').isIn(['user', 'admin'])],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { id } = req.params;
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('name email role');
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
