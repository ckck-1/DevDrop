const { z } = require('zod');
const { validate, sanitize } = require('../../utils/validate');

// Zod Schema for Startup Profile Update
const updateStartupSchema = z.object({
  companyName: z.string().min(1, { message: 'Company name is required' }).trim(),
  website: z.string().url({ message: 'Invalid website URL' }).optional().or(z.literal('')),
  industry: z.string().min(1).optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201+']).optional(),
  bio: z.string().max(2000).optional(),
  logoUrl: z.string().url({ message: 'Invalid logo URL' }).optional().or(z.literal('')),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
  path: []
});

exports.validateUpdate = [sanitize, validate({ body: updateStartupSchema })];