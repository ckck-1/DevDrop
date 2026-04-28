const applicationService = require('./application.service');
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

// Handler 2: Get Developer Apps
exports.getDeveloperApplications = async (req, res) => {
  try {
    const applications = await applicationService.getDeveloperApps(req.user.id);
    return sendSuccess(res, applications, 'Your applications retrieved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Handler 3: Get Job Applicants
exports.getJobApplicants = async (req, res) => {
  try {
    const applicants = await applicationService.getApplicantsByJob(req.params.jobId);
    return sendSuccess(res, applicants, 'Job applicants retrieved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Handler 4: Update Status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await applicationService.updateApplicationStatus(req.params.id, status);
    return sendSuccess(res, application, `Application marked as ${status}`);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};