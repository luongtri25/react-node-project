// backend/routes/profile.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

// Get current user's profile
router.get('/', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

// Update current user's profile (name, avatar; password with currentPassword)
router.put(
  '/',
  auth,
  [
    body('name').optional().isString().trim().notEmpty(),
    body('avatar').optional().isString(),
    body('password').optional().isLength({ min: 6 }),
    body('currentPassword').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, avatar, password, currentPassword } = req.body;
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Update basic fields
      if (typeof name === 'string') user.name = name.trim();
      if (typeof avatar === 'string') user.avatar = avatar;

      // Handle password change (require currentPassword)
      if (password) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'currentPassword is required to change password' });
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
        user.password = await bcrypt.hash(password, 10);
        user.provider = user.provider || 'local';
      }

      await user.save();
      const safeUser = user.toObject();
      delete safeUser.password;
      return res.json(safeUser);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
