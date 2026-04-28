const express = require('express');
const router = express.Router();
const startupController = require('./startup.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validateUpdate } = require('./startup.validator');

// All startup profile routes require authentication
router.use(protect);
router.use(authorize('startup'));

/**
 * @swagger
 * /api/v1/startups/me:
 *   get:
 *     summary: Get current startup profile
 *     tags: [Startups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Startup profile
 *       403:
 *         description: Forbidden (not a startup)
 */
router.get('/me', startupController.getMe);

/**
 * @swagger
 * /startups/me:
 *   patch:
 *     summary: Update startup profile
 *     tags: [Startups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: url
 *               industry:
 *                 type: string
 *               companySize:
 *                 type: string
 *                 enum: [1-10, 11-50, 51-200, 201+]
 *               bio:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *                 format: url
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Invalid input
 */
router.patch('/me', validateUpdate, startupController.updateMe);

/**
 * @swagger
 * /startups/{id}:
 *   get:
 *     summary: Get public startup profile
 *     tags: [Startups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public startup details
 *       404:
 *         description: Startup not found
 */
router.get('/:id', startupController.getById);

module.exports = router;