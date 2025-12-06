// middleware/admin.js
// Check user role admin
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    // auth middleware gắn sẵn req.userId (xem middleware/auth.js)
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'No user id found' });

    // If token already has role, use it to skip extra DB query
    if (req.userRole) {
      if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
      return next();
    }

    const user = await User.findById(userId).select('role');
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    // Attach role for downstream if needed
    req.userRole = user.role;
    next();
  } catch (err) {
    next(err);
  }
};
