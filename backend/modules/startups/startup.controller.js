const startupService = require('./startup.service');
const { sendSuccess, sendError } = require('../../utils/response');

// Get current startup profile
exports.getMe = async (req, res) => {
  try {
    const startup = await startupService.getStartupByUserId(req.user.id);
    sendSuccess(res, startup);
  } catch (error) {
    sendError(res, error.message, 404);
  }
};

// Update startup profile
exports.updateMe = async (req, res) => {
  try {
    const startup = await startupService.updateStartupProfile(req.user.id, req.body);
    sendSuccess(res, startup, 'Profile updated successfully');
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

// Get public startup by ID (optional)
exports.getById = async (req, res) => {
  try {
    const startup = await startupService.getStartupById(req.params.id);
    // Exclude sensitive fields (userId, contactCredits)
    const { userId, contactCredits, ...publicStartup } = startup.toObject();
    sendSuccess(res, publicStartup);
  } catch (error) {
    sendError(res, error.message, 404);
  }
};