const { z } = require('zod');
const { validate, sanitize } = require('../../utils/validate');

// Zod Schemas for Developer Profile Update
const updateDeveloperSchema = z.object({
  fullName: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  skills: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  githubUrl: z.string().url({ message: 'Invalid GitHub URL' }).optional().or(z.literal('')),
  bio: z.string().max(5000).optional(),
  location: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  availability: z.enum(['full-time', 'part-time', 'contract', 'internship', 'not-available']).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
  path: []
});

// Middleware: sanitize first, then validate
exports.validateUpdate = [sanitize, validate({ body: updateDeveloperSchema })];