const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response');

exports.register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!['developer', 'startup'].includes(role)) {
      return sendError(res, 'Invalid role', 400);
    }

    const result = await authService.register(email, password, role, name, req.ip);
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password, req.ip);
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    return sendError(res, error.message, 401);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }
    const tokens = await authService.refreshToken(refreshToken, req.ip);
    return sendSuccess(res, tokens, 'Token refreshed');
  } catch (error) {
    return sendError(res, error.message, 401);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.body?.refreshToken;
    if (token) await authService.logout(token, refreshToken);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    return sendError(res, 'Logout failed', 500);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return sendError(res, 'Token is required', 400);

    await authService.verifyEmail(token);
    return sendSuccess(res, null, 'Email verified successfully. You can now access all features.');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};