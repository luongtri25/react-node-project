 // middleware/admin.js
// Kiểm tra user là admin
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    // auth middleware trước đó đã gắn req.userId (theo file auth.js bạn gửi)
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'No user id found' });

    const user = await User.findById(userId).select('role');
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    // gắn thêm cho downstream nếu cần
    req.userRole = user.role;
    next();
  } catch (err) {
    next(err);
  }
};
 