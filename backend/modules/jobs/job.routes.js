const express = require('express');
const router = express.Router();
const jobController = require('./job.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Public Route
router.get('/feed', jobController.getFeed);
router.get('/:id', jobController.getDetails);

// Protected Route (Startups Only)
router.post(
  '/', 
  protect, 
  authorize('startup'), 
  jobController.createJob
);

module.exports = router;