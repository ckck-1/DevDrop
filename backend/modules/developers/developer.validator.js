const { body, validationResult } = require('express-validator');
const { sendError } = require('../../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }
  next();
};

exports.validateUpdate = [
  body('fullName').optional().trim().notEmpty(),
  body('title').optional().trim().notEmpty(),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experienceYears').optional().isNumeric(),
  body('githubUrl').optional().isURL(),
  validate
];