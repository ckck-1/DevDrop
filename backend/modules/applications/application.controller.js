const applicationService = require('./application.service');
const { sendSuccess, sendError } = require('../../utils/response');

exports.submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeSnapshot } = req.body;
    const application = await applicationService.applyToJob(
      req.user.id, 
      jobId, 
      { coverLetter, resumeSnapshot }
    );
    sendSuccess(res, application, 'Application submitted', 201);
  } catch (error) {
    // Handle duplicate applications via Mongo error code 11000
    if (error.code === 11000) {
      return sendError(res, 'You have already applied to this job', 400);
    }
    sendError(res, error.message, 400);
  }
};