const express = require('express');
const router = express.Router();
const applicationController = require('./application.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validateApply, validateUpdateStatus } = require('./application.validator');

router.use(protect);

/**
 * @swagger
 * /api/v1/applications:
 *   post:
 *     summary: Submit job application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *               resumeSnapshot:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Already applied or invalid data
 */
router.post('/', authorize('developer'), validateApply, applicationController.submitApplication);

/**
 * @swagger
 * /applications/my-apps:
 *   get:
 *     summary: Get developer's applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of applications
 *       403:
 *         description: Forbidden (not a developer)
 */
router.get('/my-apps', authorize('developer'), applicationController.getDeveloperApplications);

/**
 * @swagger
 * /applications/job/{jobId}:
 *   get:
 *     summary: Get applicants for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Applicants list
 *       403:
 *         description: Forbidden (not a startup)
 */
router.get('/job/:jobId', authorize('startup'), applicationController.getJobApplicants);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, shortlisted, rejected, accepted]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status or unauthorized
 */
router.patch('/:id/status', authorize('startup'), validateUpdateStatus, applicationController.updateStatus);

module.exports = router;