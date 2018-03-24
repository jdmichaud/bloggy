const express = require('express');
const lodash = require('lodash');
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
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

      //intercepts OPTIONS method
      if ('OPTIONS' === req.method) {
        //respond with 200
        res.sendStatus(200);
      }
      else {
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

  app.get(`/[^/]+/?`, (req, res) => {
    const resource = urlRegex.exec(req.url)[1];
    if (lodash.has(req.query, 'watch')) {
      watcher[resource] = watcher[resource] || [];
      watcher[resource].push(res);
    } else {
      rest.list(resource, req.query, res);
    }
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    next(err);
  });
  app.use((err, req, res, next) => {
    res.status(500).send({ error: 'Server Error' });
  });

  this.listen = () => {
    app.listen(this.config.port, this.config.host, () => {
      console.log(`server listening on http://${options.host}:${options.port}/`);
    });
  }

  return this;
}

module.exports = Server;