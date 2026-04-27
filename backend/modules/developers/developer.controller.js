const developerService = require('./developer.service');
const { sendSuccess, sendError } = require('../../utils/response');

exports.getMe = async (req, res) => {
  try {
    const profile = await developerService.getProfile(req.user.id);
    sendSuccess(res, profile);
  } catch (error) {
    sendError(res, error.message, 404);
  }
};

exports.updateMe = async (req, res) => {
  try {
    const profile = await developerService.updateProfile(req.user.id, req.body);
    sendSuccess(res, profile, 'Profile updated successfully');
  } catch (error) {
    sendError(res, error.message, 400);
  }
};