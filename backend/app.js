const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('./middlewares/rateLimiter');
const errorMiddleware = require('./middlewares/error.middleware');
const compression = require('compression');
const swaggerDocs = require('./config/swagger');
// MUST BE LINE 1

const app = express();

// 1. GLOBAL SECURITY & CORS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://your-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(cors(corsOptions));

// 2. HTTP Request Logging (except production if not needed)
if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// 3. Response Compression
app.use(compression());

// Trust proxy for rate limiting and IP logging (if behind load balancer)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// 2. SPECIAL STRIPE WEBHOOK ROUTE (Must be before express.json)
// We define it here directly or point to the module with raw enabled
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), require('./modules/payments/payment.controller').handleWebhook);

// 3. GLOBAL PARSERS (For all other routes)
app.use(express.json({ limit: '10kb' }));

// Global input sanitization (XSS, NoSQL injection protection)
const { sanitize } = require('./utils/validate');
app.use(sanitize);

// 4. RATE LIMITING
app.use('/api/', rateLimit);

// 5. MODULE ROUTES
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/user.routes'));
app.use('/api/v1/developers', require('./modules/developers/developer.routes'));
app.use('/api/v1/startups', require('./modules/startups/startup.routes'));
app.use('/api/v1/jobs', require('./modules/jobs/job.routes'));
app.use('/api/v1/applications', require('./modules/applications/application.routes'));
app.use('/api/v1/payments', require('./modules/payments/payment.routes')); // (Checkout routes)

// 6. SWAGGER DOCS
swaggerDocs(app);

// 7. 404 HANDLER
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// 8. GLOBAL ERROR HANDLER
app.use(errorMiddleware);

module.exports = app;