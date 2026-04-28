const { z } = require('zod');
const { validate, sanitize } = require('../../utils/validate');

// Application submission schema
const applySchema = z.object({
  jobId: z.string().min(1, { message: 'Job ID is required' }),
  coverLetter: z.string().max(2000).optional(),
  resumeSnapshot: z.string().max(5000).optional(),
});

// Status update schema
const statusSchema = z.object({
  status: z.enum(['applied', 'reviewed', 'interview', 'offer', 'rejected', 'withdrawn'], {
    message: 'Invalid status. Must be one of: applied, reviewed, interview, offer, rejected, withdrawn'
  }),
});

exports.validateApply = [sanitize, validate({ body: applySchema })];
exports.validateUpdateStatus = [sanitize, validate({ body: statusSchema })];