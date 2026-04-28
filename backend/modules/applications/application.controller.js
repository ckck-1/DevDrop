const applicationService = require('./application.service');
const startupRepository = require('../startups/startup.repository');
const { sendSuccess, sendError } = require('../../utils/response');

// Handler 1: Submit Application
exports.submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeSnapshot } = req.body;
    const application = await applicationService.applyToJob(
      req.user.id,
      jobId,
      { coverLetter, resumeSnapshot }
    );
    return sendSuccess(res, application, 'Application submitted', 201);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'You have already applied to this job', 400);
    }
    return sendError(res, error.message, 400);
  }
};

// Handler 2: Get Developer's Applications with Pagination
exports.getDeveloperApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await applicationService.getDeveloperApps(req.user.id, page, limit);
    return sendSuccess(res, result, 'Your applications retrieved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Handler 3: Get Job Applicants with Pagination
exports.getJobApplicants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await applicationService.getApplicantsByJob(req.params.jobId, page, limit);
    return sendSuccess(res, result, 'Job applicants retrieved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Handler 4: Update Status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Get startupId from user's profile
    const startup = await startupRepository.findByUserId(req.user.id);
    if (!startup) throw new Error('Startup profile not found');

    const application = await applicationService.updateApplicationStatus(
      req.params.id,
      status,
      startup._id
    );
    return sendSuccess(res, application, `Application marked as ${status}`);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};