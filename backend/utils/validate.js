const { ZodError } = require('zod');
const { sendError } = require('./response');

/**
 * Zod validation middleware factory
 * @param {Object} schema - Zod schema object with optional body, params, query schemas
 * Example: validate({ body: registerSchema, params: idSchema })
 */
const validate = (schemas = {}) => {
  return (req, res, next) => {
    try {
      const validationData = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      // Validate only provided schemas
      if (schemas.body) {
        schemas.body.parse(validationData.body);
      }
      if (schemas.params) {
        schemas.params.parse(validationData.params);
      }
      if (schemas.query) {
        schemas.query.parse(validationData.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        const message = `${firstError.path.join('.')} ${firstError.message}`;
        return sendError(res, message, 400);
      }
      // For other errors, pass to global error handler
      next(error);
    }
  };
};

/**
 * Sanitize input to prevent NoSQL injection and XSS
 */
const sanitize = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'string') {
        // Trim whitespace
        obj[key] = obj[key].trim();
        // Remove potential NoSQL injection characters
        obj[key] = obj[key].replace(/\$where|$gt|$lt|$eq|$ne|$in|$nin|$exists|$mod|$regex/g, '');
        // Basic XSS prevention (strip HTML tags)
        obj[key] = obj[key].replace(/<[^>]*>?/gm, '');
      } else if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map((item) => {
          if (typeof item === 'string') {
            return item.trim().replace(/<[^>]*>?/gm, '');
          }
          return item;
        });
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    });
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};

module.exports = { validate, sanitize };