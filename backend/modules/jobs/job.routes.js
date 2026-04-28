const express = require('express');
const router = express.Router();
const jobController = require('./job.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validateCreate, validateUpdate } = require('./job.validator');

// Public Routes
/**
 * @swagger
 * /api/v1/jobs/feed:
 *   get:
 *     summary: Get job feed (paginated)
 *     tags: [Jobs]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/feed', jobController.getFeed);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job details by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/:id', jobController.getDetails);

// Protected Route (Startups Only) - Create Job
/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - techStack
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *               salaryRange:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *                   currency:
 *                     type: string
 *                     default: USD
 *               jobType:
 *                 type: string
 *                 enum: [full-time, part-time, contract, internship]
 *                 default: full-time
 *               location:
 *                 type: string
 *                 default: Remote
 *     responses:
 *       201:
 *         description: Job created
 *       400:
 *         description: Invalid input
 */
router.post(
  '/',
  protect,
  authorize('startup'),
  validateCreate,
  jobController.createJob
);

// Update Job (future implementation)
// router.patch(
//   '/:id',
//   protect,
//   authorize('startup'),
//   validateUpdate,
//   jobController.updateJob
// );

module.exports = router;