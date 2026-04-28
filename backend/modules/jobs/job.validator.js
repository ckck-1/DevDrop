const { z } = require('zod');
const { validate, sanitize } = require('../../utils/validate');

// Job creation/update schema
const jobSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(200),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }).max(5000),
  techStack: z.array(z.string().min(1)).min(1, { message: 'At least one tech stack item is required' }),
  salaryRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().optional().default('USD'),
  }).optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']).default('full-time'),
  location: z.string().min(1).optional().default('Remote'),
}).refine(data => {
  if (data.salaryRange && data.salaryRange.min && data.salaryRange.max) {
    return data.salaryRange.min <= data.salaryRange.max;
  }
  return true;
}, {
  message: 'Minimum salary cannot exceed maximum salary',
  path: ['salaryRange'],
});

// For updates, all fields are optional
const jobUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  techStack: z.array(z.string().min(1)).min(1).optional(),
  salaryRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().optional().default('USD'),
  }).optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  location: z.string().min(1).optional(),
}).refine(data => {
  if (data.salaryRange && data.salaryRange.min && data.salaryRange.max) {
    return data.salaryRange.min <= data.salaryRange.max;
  }
  return true;
}, {
  message: 'Minimum salary cannot exceed maximum salary',
  path: ['salaryRange'],
});

exports.validateCreate = [sanitize, validate({ body: jobSchema })];
exports.validateUpdate = [sanitize, validate({ body: jobUpdateSchema })];
