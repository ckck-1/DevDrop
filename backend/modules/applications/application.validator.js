const { z } = require('zod');
const { validate, sanitize } = require('../../utils/validate');

// Application submission schema
const applySchema = z.object({
  // Matches the regex for a standard MongoDB ObjectId
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Job ID format" }),
  coverLetter: z.string().max(2000).optional(),
  resumeSnapshot: z.string().max(5000).optional(),
});

// Status update schema - MUST match the enum in application.model.js
const statusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'], {
    message: 'Invalid status. Must match: pending, reviewed, shortlisted, rejected, or accepted'
  }),
});

exports.validateApply = [sanitize, validate({ body: applySchema })];
exports.validateUpdateStatus = [sanitize, validate({ body: statusSchema })];