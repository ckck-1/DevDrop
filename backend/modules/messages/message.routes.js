const express = require("express");
const router = express.Router();

const threadController = require("./thread.controller");
const messageController = require("./message.controller");

const { protect } = require("../../middlewares/auth.middleware");

/* THREADS */
router.get("/threads", protect, threadController.getThreads);

router.post("/threads/find-or-create", protect, threadController.findOrCreate);
router.post(
  "/threads/from-job",
  protect,
  threadController.createFromJob
);

router.get("/threads/:id", protect, threadController.getThread);

/* MESSAGES */
router.get("/threads/:threadId/messages", protect, messageController.getMessages);

router.post("/threads/:threadId/messages", protect, messageController.sendMessage);

module.exports = router;