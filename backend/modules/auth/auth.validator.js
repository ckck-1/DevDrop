const { z } = require('zod');
const { validate, sanitize } = require('../../utils/validate');

// Zod Schemas
const registerSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }).toLowerCase().trim(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['developer', 'startup'], { message: 'Role must be developer or startup' }),
  name: z.string().min(1, { message: 'Name is required' }).trim(),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }).toLowerCase().trim(),
  password: z.string().min(1, { message: 'Password is required' }),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
});

// Middleware: sanitize inputs first, then validate
exports.validateRegister = [sanitize, validate({ body: registerSchema })];
exports.validateLogin = [sanitize, validate({ body: loginSchema })];
exports.validateRefresh = [sanitize, validate({ body: refreshTokenSchema })];
exports.validateVerifyEmail = [sanitize, validate({ query: verifyEmailSchema })];