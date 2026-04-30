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
        url: 'https://devdrop-ds91.onrender.com',
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
          type: 'http', // ✅ FIXED
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },

    // Optional: apply globally (can still override per route)
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // Paths to files containing OpenAPI annotations
  apis: [
    './modules/auth/*.js',
    './modules/users/*.js',
    './modules/developers/*.js',
    './modules/startups/*.js',
    './modules/jobs/*.js',
    './modules/applications/*.js',
    './modules/payments/*.js',
  ],
};

const specs = swaggerJsdoc(options);

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

module.exports = (app) => {
  // Swagger UI options (helps with auth persistence)
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true, // ✅ keeps token after refresh
    },
  };

  // Serve Swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

  // JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};