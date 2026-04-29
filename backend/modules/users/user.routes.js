const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../middlewares/auth.middleware.js');
const { validateUpdate } = require('./user.validator');

// All routes here require a valid JWT
router.use(protect);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', userController.getMe);

/**
 * @swagger
 * /api/v1/users/update-settings:
 *   patch:
 *     summary: Update user settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Settings updated
 *       400:
 *         description: Invalid input
 */
router.patch('/update-settings', validateUpdate, userController.updateProfile);

module.exports = router;