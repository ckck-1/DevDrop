const { z } = require('zod');
const { validate, sanitize } = require('../../utils/validate');

// Credit purchase schema
const checkoutSchema = z.object({
  credits: z.number().int().min(1, { message: 'Must purchase at least 1 credit' }).max(1000, { message: 'Cannot purchase more than 1000 credits at once' }),
});

exports.validateCheckout = [sanitize, validate({ body: checkoutSchema })];