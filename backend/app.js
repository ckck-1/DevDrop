const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('./middlewares/rateLimiter');
const errorMiddleware = require('./middlewares/error.middleware');
require('dotenv').config(); // MUST BE LINE 1


const app = express();

// 1. GLOBAL SECURITY & CORS
app.use(helmet());
app.use(cors());

// 2. SPECIAL STRIPE WEBHOOK ROUTE (Must be before express.json)
// We define it here directly or point to the module with raw enabled
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), require('./modules/payments/payment.controller').handleWebhook);

// 3. GLOBAL PARSERS (For all other routes)
app.use(express.json({ limit: '10kb' }));

// 4. RATE LIMITING
app.use('/api/', rateLimit);

// 5. MODULE ROUTES
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/user.routes'));
app.use('/api/v1/developers', require('./modules/developers/developer.routes'));
app.use('/api/v1/jobs', require('./modules/jobs/job.routes'));
app.use('/api/v1/applications', require('./modules/applications/application.routes'));
app.use('/api/v1/payments', require('./modules/payments/payment.routes')); // (Checkout routes)

// 6. 404 HANDLER
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// 7. GLOBAL ERROR HANDLER
app.use(errorMiddleware);

module.exports = app;