const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const fetch = require('node-fetch');
const lodash = require('lodash');
const Mustache = require('mustache');
const constants = require('./constants');

const Backend = function Backend(config) {
  this.config = config;

  async function buildIndex(gists) {
    // Build index
    const entries = await Promise.all(gists
      .filter(entry => lodash.keys(entry.files).includes(constants.DESCRIPTOR_FILENAME))
      .map(async (entry, index) => {
        const response = await fetch(entry.files[constants.DESCRIPTOR_FILENAME].raw_url);
        const metafile = await response.text();
        const metadata = yaml.safeLoad(metafile);
        return { title: metadata.title, index: index + 1 };
      })
    );
    const template = fs.readFileSync(path.join(config.template_path, 'index.html')).toString('utf-8');
    return Mustache.render(template, { entries });
  }

  this.routes = {
    '/?': async (req, res) => {
      // Retrieve all metas from gist server
      const response = await fetch(`https://api.github.com/users/${config.git_username}/gists`);
      const body = await response.text();
      const index = await buildIndex(JSON.parse(body));
      // Return index
      res.send(index);
    }
  };
};

module.exports = Backend;
