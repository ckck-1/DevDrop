const { z } = require('zod');
const { validate, sanitize } = require('../../utils/validate');

// User profile update schema
const updateUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).toLowerCase().trim().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
  path: []
});

exports.validateUpdate = [sanitize, validate({ body: updateUserSchema })];