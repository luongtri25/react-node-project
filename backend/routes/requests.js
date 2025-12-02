const express = require('express');
const { body, validationResult } = require('express-validator');
const Request = require('../models/request');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('name required'),
    body('phone').trim().notEmpty().withMessage('phone required'),
    body('product').optional().trim(),
    body('note').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const saved = await Request.create(req.body);
    return res.status(201).json({ ok: true, id: saved._id });
  }
);

module.exports = router;
