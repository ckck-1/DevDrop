// modules/messages/message.routes.js
const express = require("express");
const router = express.Router();

const messageController = require("./message.controller");
const { protect } = require("../../middlewares/auth.middleware");

// APPLY TO JOB (MAIN FEATURE)
router.post("/apply/:jobId", protect, messageController.applyToJob);

// GET MESSAGES IN THREAD
router.get("/thread/:threadId", protect, messageController.getMessages);

module.exports = router;