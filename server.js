const express = require('express');
const morgan = require('morgan');

const Server = function Server(config) {
  this.config = config;

  // Create the Express application
  const app = express();
  app.disable('x-powered-by');
  // For logging
  if (config.logging_enabled) {
    app.use(morgan('combined'));
  }
  // For CORS
  if (config.cors_enabled) {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

      // intercepts OPTIONS method
      if (req.method === 'OPTIONS') {
        // respond with 200
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  // The main route
  app.get('/?', (req, res) => {
    // Retrieve all README.md from gist server
    // Build index
    // Return index
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    next(err);
  });
  app.use((err, req, res) => {
    res.status(500).send({ error: 'Server Error' });
  });

  this.listen = () => {
    app.listen(this.config.port, this.config.host, () => {
      console.log(`server listening on http://${config.host}:${config.port}/`);
    });
  };

  return this;
};

module.exports = Server;
