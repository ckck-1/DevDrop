const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../middlewares/auth.middleware.js');

// All routes here require a valid JWT
router.use(protect);

router.get('/me', userController.getMe);
router.patch('/update-settings', userController.updateProfile);

module.exports = router;