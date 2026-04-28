const express = require('express');
const router = express.Router();
const applicationController = require('./application.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Basic Debugging: If this prints 'undefined', the file path is wrong
// console.log('Controller Check:', applicationController.submitApplication);

router.use(protect);

// Line 7: Submit Application
router.post('/', authorize('developer'), applicationController.submitApplication);

// Other Routes
router.get('/my-apps', authorize('developer'), applicationController.getDeveloperApplications);
router.get('/job/:jobId', authorize('startup'), applicationController.getJobApplicants);
router.patch('/:id/status', authorize('startup'), applicationController.updateStatus);

module.exports = router;