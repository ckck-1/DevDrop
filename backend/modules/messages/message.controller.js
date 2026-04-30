const messageService = require("./message.service");
const threadService = require("./thread.service");
const Job = require("../jobs/job.model");

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Safely extract User ID (handling different middleware formats)
    const currentUserId = req.user.id || req.user._id;

    console.log("👉 APPLY JOB:", jobId);
    console.log("👉 USER ID:", currentUserId);

    const job = await Job.findById(jobId);

    if (!job) {
      console.log("❌ Job not found");
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("👉 JOB FOUND:", job.title);

    const thread = await threadService.findOrCreateThread({
      jobId,
      userId: currentUserId,
      recruiterId: job.startupId,
      userMeta: {
        name: req.user.name || "Unknown",
        avatar: req.user.avatar || "",
      },
    });

    console.log("👉 THREAD ID:", thread._id);

    const message = await messageService.sendMessage(
      thread._id,
      currentUserId,
      "candidate",
      `Hi! I just applied for ${job.title}`
    );

    console.log("👉 MESSAGE CREATED");

    res.json({ thread, message });

  } catch (err) {
    console.error("🔥 APPLY ERROR:", err);
    res.status(500).json({ message: "Apply failed", error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const messages = await messageService.getMessages(req.params.threadId);
    const threads = await threadService.getThreadsForUser(currentUserId);

    const thread = threads.find((t) => t._id.toString() === req.params.threadId);

    res.json({ thread, messages });
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages" });
  }
};

exports.getThreads = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const threads = await threadService.getThreadsForUser(currentUserId);
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: "Failed to load threads" });
  }
};