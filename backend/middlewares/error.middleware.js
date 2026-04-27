const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for internal tracking
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Operational, trusted error: send message to client
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production: Don't leak sensitive stack traces
    res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Something went wrong'
    });
  }
};