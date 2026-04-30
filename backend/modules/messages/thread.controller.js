const threadService = require("./thread.service");
const jobRepo = require("../jobs/job.repository");

exports.getThreads = async (req, res) => {
  try {
    const threads = await threadService.getThreads(req.user.id);

    res.json({
      success: true,
      data: threads,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getThread = async (req, res) => {
  try {
    const thread = await threadService.getThread(req.params.id);

    res.json({
      success: true,
      data: thread,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.findOrCreate = async (req, res) => {
  try {
    const { participants } = req.body;

    const thread = await threadService.findOrCreateThread(participants);

    res.json({
      success: true,
      data: thread,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFromJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await jobRepo.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const startupUserId = job.startupId;

    const thread = await threadService.findOrCreateThread([
      { userId: req.user.id, role: req.user.role },
      { userId: startupUserId, role: "startup" },
    ]);

    res.json({
      success: true,
      data: thread,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};