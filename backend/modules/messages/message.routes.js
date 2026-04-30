const express = require("express");
const router = express.Router();

const controller = require("./message.controller");
const { protect } = require("../../middlewares/auth.middleware");

// APPLY TO JOB
router.post("/apply/:jobId", protect, controller.applyToJob);

// THREAD MESSAGES
router.get("/thread/:threadId", protect, controller.getMessages);

// THREAD LIST
router.get("/threads", protect, controller.getThreads);

module.exports = router;