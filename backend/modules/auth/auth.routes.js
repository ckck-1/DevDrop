const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validateRegister, validateLogin } = require('./auth.validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/verify-email', authController.verifyEmail);

module.exports = router;