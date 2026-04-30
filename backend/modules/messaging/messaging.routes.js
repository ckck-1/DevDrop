const express = require('express');
const router = express.Router();
const messagingController = require('./messaging.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect); // All messaging requires login
router.post('/apply/:jobId', messagingController.applyToJob); 



router.post('/send', messagingController.send);
router.get('/conversations', messagingController.fetchConversations);
router.get('/:conversationId', messagingController.fetchMessages);

module.exports = router;