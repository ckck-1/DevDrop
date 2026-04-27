const { body, validationResult } = require('express-validator');
const { sendError } = require('../../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }
  next();
};

exports.validateRegister = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
  body('role').notEmpty(),
  body('name').notEmpty().withMessage('Name is required'),
  validate
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];