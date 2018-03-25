const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const fetch = require('node-fetch');
const lodash = require('lodash');
const Mustache = require('mustache');
const getRemoteFile = require('./get-remote-file');

const constants = require('./constants');
const Converter = require('./converter');

const Backend = function Backend(config) {
  this.config = config;
  this.converter = new Converter(config);

  const buildIndex = async (gists) => {
    // Build index
    const publishables = gists
      // Filter on gist which have a README and a meta file
      .filter(entry =>
        lodash.keys(entry.files).includes(constants.DESCRIPTOR_FILENAME) &&
        lodash.keys(entry.files).includes('README.md'))
      // Sort by creation date (oldest last)
      .sort((a, b) => Date.parse(a.created_at) > Date.parse(b.created_at));
    const entries = await Promise.all(publishables.map(async (entry, index) => {
      const metafile = await getRemoteFile(entry.files[constants.DESCRIPTOR_FILENAME].raw_url);
      const metadata = yaml.safeLoad(metafile);
      return {
        title: metadata.title,
        index: publishables.length - index,
        id: entry.id,
      };
    }));
    const templatePath = path.join(config.template_path, 'index.html');
    const template = fs.readFileSync(templatePath).toString('utf-8');
    return Mustache.render(template, { entries });
  };

  const render = async (gist) => {
    const readme = await getRemoteFile(gist.files['README.md'].raw_url);
    const metafile = await getRemoteFile(gist.files[constants.DESCRIPTOR_FILENAME].raw_url);
    const metadata = yaml.safeLoad(metafile);
    const content = this.converter.convert(await this.converter.preProcess(gist, readme));
    const templatePath = path.join(config.template_path, 'gist.html');
    const template = fs.readFileSync(templatePath).toString('utf-8');
    return Mustache.render(template, {
      metadata,
      content,
    });
  };

  this.routes = {
    '/?': async (req, res) => {
      // Retrieve all metas from gist server
      const response = await fetch(`https://api.github.com/users/${config.git_username}/gists`);
      const body = await response.text();
      const index = await buildIndex(JSON.parse(body));
      // Return index
      res.send(index);
    },
    '/[a-z0-9]*/?': async (req, res) => {
      const id = req.url.replace('/', '');
      const response = await fetch(`https://api.github.com/gists/${id}`);
      const body = await response.text();
      const gist = await render(JSON.parse(body));
      res.send(gist);
    }
  };

  return this;
};

module.exports = Backend;
