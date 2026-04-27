const jwt = require('jsonwebtoken');
const { redis } = require('../config/redis');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return sendError(res, 'Not authorized', 401);

    // Check Redis Blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) return sendError(res, 'Token expired or revoked', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return sendError(res, 'Invalid token', 401);
  }
};

// Role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Permission denied', 403);
    }
    next();
  };
};

module.exports = { protect, authorize };