const express = require('express');
const router = express.Router();
const developerController = require('./developer.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validateUpdate } = require('./developer.validator');

// All developer profile routes are protected
router.use(protect);
router.use(authorize('developer'));

/**
 * @swagger
 * /api/v1/developers/me:
 *   get:
 *     summary: Get current developer profile
 *     tags: [Developers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Developer profile
 *       403:
 *         description: Forbidden (not a developer)
 */
router.get('/me', developerController.getMe);

/**
 * @swagger
 * /developers/me:
 *   patch:
 *     summary: Update developer profile
 *     tags: [Developers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               title:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceYears:
 *                 type: number
 *               githubUrl:
 *                 type: string
 *                 format: url
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Invalid input
 */
router.patch('/me', validateUpdate, developerController.updateMe);

module.exports = router;