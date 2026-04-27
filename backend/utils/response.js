// utils/response.js
exports.sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

exports.sendError = (res, message = "Server Error", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};