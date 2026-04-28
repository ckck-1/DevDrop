const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response');

exports.register = async (req, res, next) => {
  try {
    const { email, password, role, name } = req.body;
    
    if (!['developer', 'startup'].includes(role)) {
      return sendError(res, 'Invalid role', 400);
    }
    
    // Let the service handle registration AND email sending logic
    const result = await authService.register(email, password, role, name);
    
    // Send ONE response and stop
    return sendSuccess(res, result, 'Registration successful', 201);
    
  } catch (error) {
    // If authService fails, it caught here
    return sendError(res, error.message, 400);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    sendError(res, error.message, 401);
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return sendError(res, 'Token is required', 400);

    await authService.verifyEmail(token);
    sendSuccess(res, null, 'Email verified successfully. You can now access all features.');
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await authService.logout(token);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    sendError(res, 'Logout failed', 500);
  }
};