const express = require('express');
const router = express.Router();
const developerController = require('./developer.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// All developer profile routes are protected
router.use(protect);
router.use(authorize('developer'));

router.get('/me', developerController.getMe);
router.patch('/me', developerController.updateMe);

module.exports = router;