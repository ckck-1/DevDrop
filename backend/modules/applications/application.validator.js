const { z } = require('zod');
const { validate, sanitize } = require('../../utils/validate');

// Application submission schema
const applySchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Job ID format" }), // Validates MongoDB ID
  coverLetter: z.string().optional(),
  resumeSnapshot: z.string().optional(),
});

// Status update schema
const statusSchema = z.object({
  status: z.enum(['applied', 'reviewed', 'interview', 'offer', 'rejected', 'withdrawn'], {
    message: 'Invalid status. Must be one of: applied, reviewed, interview, offer, rejected, withdrawn'
  }),
});

exports.validateApply = [sanitize, validate({ body: applySchema })];
exports.validateUpdateStatus = [sanitize, validate({ body: statusSchema })];