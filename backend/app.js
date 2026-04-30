const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('./middlewares/rateLimiter');
const errorMiddleware = require('./middlewares/error.middleware');
const compression = require('compression');
const swaggerDocs = require('./config/swagger');

const messageRoutes = require("./modules/messages/message.routes");

const app = express();

// 0. PROXY CONFIGURATION (Critical for Render/Rate Limiting)
app.set('trust proxy', 1);

// 1. SECURITY (Helmet)
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

// 2. CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "https://devdrop-ds91.onrender.com" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// 3. LOGGING
if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// 4. COMPRESSION
app.use(compression());

// 5. STRIPE WEBHOOK (must be BEFORE json parser)
app.use(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./modules/payments/payment.controller').handleWebhook
);

// 6. BODY PARSER
app.use(express.json({ limit: '10kb' }));

// 7. SANITIZATION
const { sanitize } = require('./utils/validate');
app.use(sanitize);

// 8. RATE LIMITING (Applied to all API routes)
app.use('/api/', rateLimit);

// 9. ROUTES
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/user.routes'));
app.use('/api/v1/developers', require('./modules/developers/developer.routes'));
app.use("/api/v1/messages", messageRoutes);
app.use('/api/v1/startups', require('./modules/startups/startup.routes'));
app.use('/api/v1/jobs', require('./modules/jobs/job.routes'));
app.use('/api/v1/applications', require('./modules/applications/application.routes'));
app.use('/api/v1/payments', require('./modules/payments/payment.routes'));

// 10. SWAGGER DOCS
swaggerDocs(app);

// 11. 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// 12. GLOBAL ERROR HANDLER
app.use(errorMiddleware);

module.exports = app;