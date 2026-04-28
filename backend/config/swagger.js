const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevDrop API',
      version: '1.0.0',
      description: 'AI-Powered Developer Recruitment Platform API',
      contact: {
        name: 'DevDrop Support',
        email: 'support@devdrop.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
      {
        url: process.env.CLIENT_URL || 'https://devdrop.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI annotations
  apis: [
    './modules/auth/auth.routes.js',
    './modules/auth/auth.controller.js',
    './modules/users/user.routes.js',
    './modules/users/user.controller.js',
    './modules/developers/developer.routes.js',
    './modules/developers/developer.controller.js',
    './modules/startups/startup.routes.js',
    './modules/startups/startup.controller.js',
    './modules/jobs/job.routes.js',
    './modules/jobs/job.controller.js',
    './modules/applications/application.routes.js',
    './modules/applications/application.controller.js',
    './modules/payments/payment.routes.js',
    './modules/payments/payment.controller.js',
  ],
};

const specs = swaggerJsdoc(options);

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

module.exports = (app) => {
  // Serve Swagger docs at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Also serve JSON at /api-docs.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};