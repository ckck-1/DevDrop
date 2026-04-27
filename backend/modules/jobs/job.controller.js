const jobService = require('./job.service');
const { sendSuccess, sendError } = require('../../utils/response');

exports.createJob = async (req, res) => {
  try {
    // req.user.id comes from authMiddleware
    const job = await jobService.postJob(req.user.id, req.body);
    sendSuccess(res, job, 'Job posted successfully', 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

exports.getFeed = async (req, res) => {
  try {
    const jobs = await jobService.getJobFeed(req.query);
    sendSuccess(res, jobs, 'Feed retrieved successfully');
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

exports.getDetails = async (req, res) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) return sendError(res, 'Job not found', 404);
    sendSuccess(res, job);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};