const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Accept token from header OR query (for CSV export)
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.query.token;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== role) return res.status(403).json({ message: 'Access denied' });
  next();
};

module.exports = { auth, requireRole };
