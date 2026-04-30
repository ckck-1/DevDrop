exports.createFromJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await require("../jobs/job.repository").findById(jobId);

    const startupUserId = job.startupId; // adjust if populated

    const thread = await require("./thread.service").findOrCreateThread([
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