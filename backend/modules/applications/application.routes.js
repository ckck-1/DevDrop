const express = require('express');
const router = express.Router();
const applicationController = require('./application.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

router.use(protect);

// Developers: Apply and View My Applications
router.post('/', authorize('developer'), applicationController.submitApplication);
router.get('/my-apps', authorize('developer'), applicationController.getDeveloperApplications);

// Startups: View Applicants for a Job and Update Status
router.get('/job/:jobId', authorize('startup'), applicationController.getJobApplicants);
router.patch('/:id/status', authorize('startup'), applicationController.updateStatus);

module.exports = router;