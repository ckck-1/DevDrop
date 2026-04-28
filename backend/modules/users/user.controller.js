const userRepository = require('./user.repository');
const { sendSuccess, sendError } = require('../../utils/response');

exports.getMe = async (req, res) => {
  try {
    // req.user.id is populated by the protect middleware
    const user = await userRepository.findById(req.user.id);
    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user, 'User profile retrieved');
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Basic protection: don't allow duplicate emails during update
    if (email) {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return sendError(res, 'Email already in use', 400);
      }
    }

    const updatedUser = await userRepository.update(req.user.id, req.body);
    sendSuccess(res, updatedUser, 'Settings updated successfully');
  } catch (error) {
    sendError(res, error.message, 400);
  }
};