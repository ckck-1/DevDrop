const messageService = require("./message.service");
const threadService = require("./thread.service");
const Job = require("../jobs/job.model");

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const thread = await threadService.findOrCreateThread({
      jobId,
      userId: req.user._id,
      recruiterId: job.createdBy,
      userMeta: {
        name: req.user.name,
        avatar: req.user.avatar,
      },
    });

    const message = await messageService.sendMessage(
      thread._id,
      req.user._id,
      "candidate",
      `Hi! I just applied for ${job.title}`
    );

    res.json({ thread, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Apply failed" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await messageService.getMessages(req.params.threadId);
    const threads = await threadService.getThreadsForUser(req.user._id);

    const thread = threads.find((t) => t._id.toString() === req.params.threadId);

    res.json({ thread, messages });
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages" });
  }
};

exports.getThreads = async (req, res) => {
  try {
    const threads = await threadService.getThreadsForUser(req.user._id);
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: "Failed to load threads" });
  }
};